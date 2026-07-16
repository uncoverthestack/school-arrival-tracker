import { getAdminSession } from '@/lib/session'
import { countStudentsBySchool, isCodeUnique, createStudent } from '@/lib/repo/students'

const MAX_ROWS = 1000

function currentSchoolYear() {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

async function generateUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    if (await isCodeUnique(candidate)) return candidate
  }
  throw new Error('Could not generate unique code')
}

export async function POST(request) {
  const session = await getAdminSession()
  if (!session.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rows = Array.isArray(body.rows) ? body.rows : null
  if (!rows || rows.length === 0) {
    return Response.json({ error: 'rows must be a non-empty array' }, { status: 400 })
  }
  if (rows.length > MAX_ROWS) {
    return Response.json({ error: `Cannot import more than ${MAX_ROWS} rows at once` }, { status: 400 })
  }

  const year = new Date().getFullYear()
  let seq = await countStudentsBySchool(session.schoolId)
  const codeYear = currentSchoolYear()

  const created = []
  const errors = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const name = String(row.name ?? '').trim()
    const studentClass = String(row.studentClass ?? '').trim()
    const parentPhone = String(row.parentPhone ?? '').trim()

    if (!name || !studentClass || !parentPhone) {
      errors.push({ row: i + 1, name: name || null, error: 'name, studentClass, and parentPhone are required' })
      continue
    }

    seq += 1
    const studentId = `SCH-${year}-${String(seq).padStart(4, '0')}`

    let code
    try {
      code = await generateUniqueCode()
    } catch {
      errors.push({ row: i + 1, name, error: 'Could not generate a unique gate code' })
      continue
    }

    const student = await createStudent({
      schoolId: session.schoolId,
      studentId,
      name,
      studentClass,
      parentName: row.parentName ? String(row.parentName).trim() : null,
      parentPhone,
      parentEmail: row.parentEmail ? String(row.parentEmail).trim() : null,
      cardId: row.cardId ? String(row.cardId).trim() : studentId,
      code,
      codeYear,
      photoUrl: null,
    })

    created.push(student)
  }

  return Response.json({ created: created.length, errors }, { status: 201 })
}
