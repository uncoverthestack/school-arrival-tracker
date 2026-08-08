/**
 * Google Apps Script: on every Form submission, uploads the photo question's
 * file straight into Supabase Storage, then immediately creates the student
 * in the admin portal (via its authenticated /api/students endpoint) with
 * that photo already attached — no manual CSV/Bulk Import step. The
 * generated gate `code` and `studentId` get written back into the response
 * Sheet on the same row, right next to the submission.
 *
 * REACHABILITY — READ THIS FIRST
 * This script calls out from Google's servers to your admin portal over the
 * public internet. `http://localhost:3000` is NOT reachable from Google —
 * ADMIN_PORTAL_URL must point at a real publicly-reachable URL (a Vercel
 * deployment, or a temporary tunnel like ngrok pointed at your local dev
 * server). Local-only URLs will fail with a fetch/connection error on every
 * submission.
 *
 * SETUP
 * 1. Open the Google Sheet collecting your Form's responses.
 * 2. Extensions > Apps Script. Paste this file's contents in, replacing the
 *    default Code.gs.
 * 3. Project Settings (gear icon) > Script Properties > add:
 *      SUPABASE_URL                 e.g. https://yourproject.supabase.co
 *      SUPABASE_SERVICE_ROLE_KEY    Project Settings > API > service_role key
 *      SCHOOL_ID                    the schools.id row this roster belongs to
 *      ADMIN_PORTAL_URL             e.g. https://your-app.vercel.app (no trailing slash)
 *      SCHOOL_API_KEY               that school's schools.api_key (same value used
 *                                    in its gate URL's ?key= param)
 * 4. Update PHOTO_QUESTION_TITLE below to match your Form's file-upload
 *    question exactly (case-sensitive — it becomes the response column header).
 *    Also confirm the other FIELD_* constants below match your Form's
 *    question titles.
 * 5. Triggers (clock icon) > Add Trigger:
 *      function: onFormSubmitPhotoSync
 *      event source: From spreadsheet
 *      event type: On form submit
 * 6. Submit a test response with a photo, confirm `photoUrl`, `code`, and
 *    `studentId` columns all appear on that row.
 *
 * SECURITY NOTE
 * The service_role key bypasses Row Level Security and can read/write your
 * entire Supabase project, not just this bucket. SCHOOL_API_KEY grants full
 * student-creation rights for that one school. Both are only as safe as this
 * script's editor access — keep it restricted, rotate either key if the
 * script is ever shared or copied elsewhere.
 */

const BUCKET = 'student-photos'
const PHOTO_QUESTION_TITLE = 'studentPhoto' // must match your Form question's title exactly

// Must match your Form's other question titles exactly — these become the
// response Sheet's column headers, same as PHOTO_QUESTION_TITLE above.
const FIELD_NAME = 'Name'
const FIELD_CLASS = 'studentClass'
const FIELD_PARENT_NAME = 'parentName'
const FIELD_PARENT_PHONE = 'parentPhone'
const FIELD_PARENT_EMAIL = 'parentEmail'
const FIELD_CARD_ID = 'cardId'
const FIELD_USES_BUS = 'usesBus'

function onFormSubmitPhotoSync(e) {
  const props = PropertiesService.getScriptProperties()
  const supabaseUrl = props.getProperty('SUPABASE_URL')
  const serviceKey = props.getProperty('SUPABASE_SERVICE_ROLE_KEY')
  const schoolId = props.getProperty('SCHOOL_ID')
  const adminPortalUrl = props.getProperty('ADMIN_PORTAL_URL')
  const schoolApiKey = props.getProperty('SCHOOL_API_KEY')

  if (!supabaseUrl || !serviceKey || !schoolId || !adminPortalUrl || !schoolApiKey) {
    throw new Error(
      'Missing one of SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SCHOOL_ID / ' +
      'ADMIN_PORTAL_URL / SCHOOL_API_KEY script property — set them under ' +
      'Project Settings > Script Properties.'
    )
  }

  const sheet = e.range.getSheet()
  const row = e.range.getRow()
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const getField = (title) => {
    const i = headers.indexOf(title)
    return i === -1 ? '' : sheet.getRange(row, i + 1).getValue()
  }

  const photoUrl = uploadPhotoIfPresent({ sheet, headers, row, schoolId, supabaseUrl, serviceKey })

  const payload = {
    name: String(getField(FIELD_NAME) || '').trim(),
    studentClass: String(getField(FIELD_CLASS) || '').trim(),
    parentName: String(getField(FIELD_PARENT_NAME) || '').trim() || null,
    parentPhone: String(getField(FIELD_PARENT_PHONE) || '').trim(),
    parentEmail: String(getField(FIELD_PARENT_EMAIL) || '').trim() || null,
    cardId: String(getField(FIELD_CARD_ID) || '').trim() || null,
    usesBus: /^(yes|true|1)$/i.test(String(getField(FIELD_USES_BUS) || '').trim()),
    photoUrl: photoUrl || null,
  }

  if (!payload.name || !payload.studentClass || !payload.parentPhone) {
    console.warn(`Row ${row}: missing name/studentClass/parentPhone — skipping student creation.`)
    return
  }

  const response = UrlFetchApp.fetch(`${adminPortalUrl}/api/students`, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': schoolApiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })

  const body = JSON.parse(response.getContentText() || '{}')
  if (response.getResponseCode() >= 300) {
    throw new Error(`Student creation failed (row ${row}): ${response.getContentText()}`)
  }

  writeToColumn(sheet, headers, row, 'code', body.student.code)
  writeToColumn(sheet, headers, row, 'studentId', body.student.studentId)
}

// Uploads the row's photo question to Supabase Storage, if one was attached
// to this response, and records the public URL on the row. Returns the URL
// (or null if this response had no photo) for immediate use when creating
// the student — the sheet column is just a record of it, not the source of
// truth read back later.
function uploadPhotoIfPresent({ sheet, headers, row, schoolId, supabaseUrl, serviceKey }) {
  const photoColIndex = headers.indexOf(PHOTO_QUESTION_TITLE)
  if (photoColIndex === -1) {
    console.warn(`No "${PHOTO_QUESTION_TITLE}" column found — skipping photo upload for row ${row}.`)
    return null
  }

  const cellValue = sheet.getRange(row, photoColIndex + 1).getValue()
  const fileId = extractDriveFileId(cellValue)
  if (!fileId) return null // no photo on this response

  const blob = DriveApp.getFileById(fileId).getBlob()
  const ext = (blob.getContentType() || '').split('/')[1] || 'jpg'
  const path = `${schoolId}/${Utilities.getUuid()}.${ext}`

  const response = UrlFetchApp.fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'post',
    contentType: blob.getContentType(),
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    payload: blob.getBytes(),
    muteHttpExceptions: true,
  })

  if (response.getResponseCode() >= 300) {
    throw new Error(`Supabase upload failed (row ${row}): ${response.getContentText()}`)
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`
  writeToColumn(sheet, headers, row, 'photoUrl', publicUrl)
  return publicUrl
}

// Google Forms records a file-upload answer as a Drive URL
// (e.g. https://drive.google.com/open?id=FILE_ID) — pull the ID out of it.
function extractDriveFileId(cellValue) {
  const match = String(cellValue || '').match(/[-\w]{25,}/)
  return match ? match[0] : null
}

// Finds `columnName`'s index, creating the header if it doesn't exist yet,
// then writes `value` into that column for `row`.
function writeToColumn(sheet, headers, row, columnName, value) {
  let index = headers.indexOf(columnName)
  if (index === -1) {
    index = headers.length
    sheet.getRange(1, index + 1).setValue(columnName)
    headers.push(columnName) // keep the in-memory copy in sync within this run
  }
  sheet.getRange(row, index + 1).setValue(value)
}
