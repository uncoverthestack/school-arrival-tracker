'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights'

// Module-level cache — shared with FaceScanView so models only load once.
let cachedFaceApi = null

async function getFaceApi() {
  if (!cachedFaceApi) {
    cachedFaceApi = await import('face-api.js')
  }
  const fa = cachedFaceApi
  if (!fa.nets.tinyFaceDetector.isLoaded) {
    await Promise.all([
      fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      fa.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ])
  }
  return fa
}

async function uploadPhoto(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/students/photo', { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Upload failed')
  return data.photoUrl
}

// Formats the class dropdown options from the school's configured levels/arms.
function classOptions(classes) {
  return classes.map(c => ({ value: `${c.level}${c.arm}`, label: `${c.level} ${c.arm}` }))
}

function PhotoField({ photoUrl, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadPhoto(file)
      onChange(url)
    } catch (err) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm text-on-surface-variant mb-1">Photo</label>
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border border-outline-variant" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-surface-container border border-outline-variant" />
        )}
        <label className="flex-1 text-center py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold cursor-pointer transition-colors">
          {uploading ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Upload photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  )
}

function ClassSelect({ classes, value, onChange }) {
  const options = classOptions(classes)
  // Keep a pre-existing value selectable even if it no longer matches a configured class.
  const hasCurrent = value && !options.some(o => o.value === value)

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required
      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
    >
      <option value="" disabled>Select a class</option>
      {hasCurrent && <option value={value}>{value} (not in class list)</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function EditModal({ student, classes, onClose }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(student.name)
  const [studentClass, setStudentClass] = useState(student.studentClass ?? '')
  const [photoUrl, setPhotoUrl] = useState(student.photoUrl ?? '')
  const [usesBus, setUsesBus] = useState(student.usesBus ?? false)
  const [parentName, setParentName] = useState(student.parent?.name ?? '')
  const [parentPhone, setParentPhone] = useState(student.parent?.phone ?? '')
  const [parentEmail, setParentEmail] = useState(student.parent?.email ?? '')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const classChanged = studentClass.trim() !== (student.studentClass ?? '')
  const phoneChanged = parentPhone.trim() !== (student.parent?.phone ?? '')

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    const res = await fetch(`/api/students/${student.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        studentClass: studentClass.trim(),
        photoUrl: photoUrl || null,
        usesBus,
        parentName: parentName.trim() || null,
        parentPhone: parentPhone.trim() || null,
        parentEmail: parentEmail.trim() || null,
      })
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

    setResult(data.codeRotated
      ? `Promoted — new gate code: ${data.student.code}`
      : `Saved — code unchanged (repeating same class)`)

    startTransition(() => router.refresh())
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-1">Edit Student</h2>
        <p className="text-xs text-on-surface-variant mb-5">
          Changing the class will generate a new gate code (promotion).
          Keeping the same class preserves the code (repeating year).
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Class</label>
            <ClassSelect classes={classes} value={studentClass} onChange={setStudentClass} />
            {classChanged && (
              <p className="text-xs text-warning mt-1">Class changed → gate code will be rotated</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Parent Name</label>
            <input
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Parent Phone</label>
            <input
              value={parentPhone}
              onChange={e => setParentPhone(e.target.value)}
              required
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
            {phoneChanged && (
              <p className="text-xs text-warning mt-1">
                Different number → this student will be linked to a different (or new) parent record.
                Other students sharing the old number are unaffected.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Parent Email</label>
            <input
              type="email"
              value={parentEmail}
              onChange={e => setParentEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <PhotoField photoUrl={photoUrl} onChange={setPhotoUrl} />

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={usesBus} onChange={e => setUsesBus(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm text-on-surface">Uses school bus</span>
          </label>
          <p className="text-xs text-on-surface-variant -mt-3">
            Bus riders are exempt from the &quot;not in school&quot; cutoff-time alert — their arrival depends on the route.
          </p>

          {error && <p className="text-error text-sm">{error}</p>}
          {result && <p className="text-success text-sm font-mono">{result}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-primary hover:opacity-90 disabled:bg-surface-container disabled:text-on-surface-variant font-bold transition-colors"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EnrollFaceModal({ student, onClose }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // idle | loading | done | error
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function handleEnroll() {
    if (!student.photoUrl) return
    setStatus('loading')
    setMessage('Loading AI models (first time may take a moment)…')

    try {
      const faceapi = await getFaceApi()
      setMessage('Analysing photo…')

      const img = await new Promise((resolve, reject) => {
        const el = new Image()
        el.crossOrigin = 'anonymous'
        el.onload = () => resolve(el)
        el.onerror = reject
        el.src = student.photoUrl
      })

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      if (!detection) {
        setStatus('error')
        setMessage('No face detected. Upload a clear, front-facing photo then try again.')
        return
      }

      const descriptor = Array.from(detection.descriptor)

      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: descriptor })
      })

      if (!res.ok) {
        const err = await res.json()
        setStatus('error')
        setMessage(err.error ?? 'Failed to save face data.')
        return
      }

      setStatus('done')
      setMessage('Face enrolled! This student can now use face scan at the gate.')
      startTransition(() => router.refresh())
    } catch (err) {
      console.error('EnrollFace:', err)
      const isCors = err?.name === 'SecurityError' || String(err).toLowerCase().includes('cors')
      setStatus('error')
      setMessage(isCors
        ? 'Photo blocked by CORS — configure your image storage to allow cross-origin reads.'
        : `Something went wrong: ${err?.message ?? err}`)
    }
  }

  async function handleRemove() {
    setStatus('loading')
    setMessage('Removing face data…')
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: null })
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('done')
      setMessage('Face data removed.')
      startTransition(() => router.refresh())
    } catch {
      setStatus('error')
      setMessage('Could not remove face data.')
    }
  }

  const hasEnrolled = !!student.faceDescriptor

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-1">Face ID — {student.name}</h2>
        <p className="text-xs text-on-surface-variant mb-5">
          {hasEnrolled
            ? 'This student already has a face enrolled. You can re-enroll or remove it.'
            : 'Enroll a face ID so this student can be recognised at the gate without a card or code.'}
        </p>

        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt={student.name}
            crossOrigin="anonymous"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-5 border-2 border-outline-variant"
          />
        ) : (
          <p className="text-warning text-sm mb-5">
            No photo on file — upload a photo first, then enroll the face.
          </p>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
            <p className="text-sm text-on-surface">{message}</p>
          </div>
        )}
        {status === 'done' && <p className="text-success text-sm mb-4">{message}</p>}
        {status === 'error' && <p className="text-error text-sm mb-4">{message}</p>}

        <div className="flex flex-col gap-2">
          {student.photoUrl && (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={status === 'loading' || isPending}
              className="w-full py-3 rounded-xl bg-primary hover:opacity-90 disabled:bg-surface-container disabled:text-on-surface-variant font-bold transition-colors"
            >
              {hasEnrolled ? 'Re-enroll Face' : 'Enroll Face'}
            </button>
          )}
          {hasEnrolled && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={status === 'loading' || isPending}
              className="w-full py-3 rounded-xl bg-error-container hover:opacity-90 text-error font-semibold transition-colors disabled:opacity-40"
            >
              Remove Face Data
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'loading'}
            className="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function AddStudentModal({ classes, onClose }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [usesBus, setUsesBus] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        studentClass,
        parentName: parentName.trim() || null,
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim() || null,
        photoUrl: photoUrl || null,
        usesBus,
      })
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

    startTransition(() => router.refresh())
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-5">Add Student</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Class</label>
            {classes.length === 0 ? (
              <p className="text-xs text-warning">
                No classes configured yet — use &ldquo;Manage Classes&rdquo; to add one first.
              </p>
            ) : (
              <ClassSelect classes={classes} value={studentClass} onChange={setStudentClass} />
            )}
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Parent Name</label>
            <input
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Parent Phone</label>
            <input
              value={parentPhone}
              onChange={e => setParentPhone(e.target.value)}
              required
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Parent Email</label>
            <input
              type="email"
              value={parentEmail}
              onChange={e => setParentEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <PhotoField photoUrl={photoUrl} onChange={setPhotoUrl} />

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={usesBus} onChange={e => setUsesBus(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm text-on-surface">Uses school bus</span>
          </label>

          {error && <p className="text-error text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving || classes.length === 0}
              className="flex-1 py-3 rounded-xl bg-primary hover:opacity-90 disabled:bg-surface-container disabled:text-on-surface-variant font-bold transition-colors"
            >
              {saving ? 'Adding…' : 'Add Student'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Minimal CSV parser — handles quoted fields (so names/addresses with commas survive).
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []

  function parseLine(line) {
    const fields = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
        else if (ch === '"') { inQuotes = false }
        else cur += ch
      } else if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(cur); cur = ''
      } else {
        cur += ch
      }
    }
    fields.push(cur)
    return fields.map(f => f.trim())
  }

  const header = parseLine(lines[0]).map(h => h.toLowerCase())
  return lines.slice(1).map(line => {
    const values = parseLine(line)
    const row = {}
    header.forEach((key, i) => { row[key] = values[i] ?? '' })
    return row
  })
}

function BulkImportModal({ onClose }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [importing, setImporting] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setResult(null)
    setFileName(file.name)

    const text = await file.text()
    const parsed = parseCsv(text).map(r => ({
      name: r.name,
      studentClass: r.studentclass ?? r.class,
      parentName: r.parentname,
      parentPhone: r.parentphone,
      parentEmail: r.parentemail,
      cardId: r.cardid,
      usesBus: ['true', 'yes', '1'].includes((r.usesbus ?? '').toLowerCase()),
    }))
    setRows(parsed)
  }

  async function handleImport() {
    setImporting(true)
    setError('')
    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Import failed')
      setResult(data)
      startTransition(() => router.refresh())
    } catch (err) {
      setError(err.message ?? 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-1">Bulk Import Students</h2>
        <p className="text-xs text-on-surface-variant mb-5">
          CSV with columns: name, studentClass, parentName, parentPhone, parentEmail, cardId, usesBus
          (name, studentClass, and parentPhone are required — usesBus accepts true/yes/1).
        </p>

        <label className="block w-full text-center py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold cursor-pointer transition-colors mb-4">
          {fileName || 'Choose CSV file'}
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        </label>

        {rows.length > 0 && !result && (
          <p className="text-sm text-on-surface-variant mb-4">{rows.length} row{rows.length !== 1 ? 's' : ''} ready to import.</p>
        )}

        {error && <p className="text-error text-sm mb-4">{error}</p>}

        {result && (
          <div className="mb-4 space-y-2">
            <p className="text-success text-sm font-semibold">{result.created} student{result.created !== 1 ? 's' : ''} imported.</p>
            {result.errors.length > 0 && (
              <div className="bg-error-container border border-error rounded-lg p-3 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-error text-xs">
                    Row {e.row}{e.name ? ` (${e.name})` : ''}: {e.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!result && (
            <button
              type="button"
              onClick={handleImport}
              disabled={rows.length === 0 || importing}
              className="flex-1 py-3 rounded-xl bg-primary hover:opacity-90 disabled:bg-surface-container disabled:text-on-surface-variant font-bold transition-colors"
            >
              {importing ? 'Importing…' : `Import ${rows.length || ''}`}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function ManageClassesModal({ classes, onClose }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [level, setLevel] = useState('')
  const [arm, setArm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const grouped = classes.reduce((acc, c) => {
    (acc[c.level] ??= []).push(c)
    return acc
  }, {})

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, arm })
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Could not add class'); return }
    setLevel(''); setArm('')
    startTransition(() => router.refresh())
  }

  async function handleDelete(id) {
    await fetch(`/api/classes?id=${id}`, { method: 'DELETE' })
    startTransition(() => router.refresh())
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-1">Manage Classes</h2>
        <p className="text-xs text-on-surface-variant mb-5">
          Define class levels and arms (e.g. JSS1 → A, B, C). Add as many arms as you need.
        </p>

        <div className="space-y-4 mb-5">
          {Object.keys(grouped).length === 0 && (
            <p className="text-sm text-on-surface-variant">No classes configured yet.</p>
          )}
          {Object.entries(grouped).map(([lvl, arms]) => (
            <div key={lvl}>
              <p className="text-sm font-semibold text-on-surface mb-1.5">{lvl}</p>
              <div className="flex flex-wrap gap-2">
                {arms.map(c => (
                  <span key={c.id} className="flex items-center gap-1.5 bg-surface-container rounded-full pl-3 pr-1.5 py-1 text-sm">
                    {c.arm}
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
                      aria-label={`Remove ${lvl} ${c.arm}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-2">
          <input
            value={level}
            onChange={e => setLevel(e.target.value)}
            placeholder="Level (e.g. JSS1)"
            required
            className="flex-1 min-w-0 bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            value={arm}
            onChange={e => setArm(e.target.value)}
            placeholder="Arm (e.g. D)"
            required
            className="w-20 bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 rounded-xl bg-primary hover:opacity-90 disabled:bg-surface-container disabled:text-on-surface-variant font-bold text-sm transition-colors"
          >
            Add
          </button>
        </form>
        {error && <p className="text-error text-xs mb-4">{error}</p>}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function StudentsClient({ students, classes }) {
  const [editing, setEditing] = useState(null)
  const [enrolling, setEnrolling] = useState(null)
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)
  const [managingClasses, setManagingClasses] = useState(false)

  const toolbar = (
    <div className="flex flex-wrap gap-3 mb-6">
      <button
        onClick={() => setAdding(true)}
        className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-sm font-bold transition-colors"
      >
        + Add Student
      </button>
      <button
        onClick={() => setImporting(true)}
        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-colors"
      >
        Bulk Import
      </button>
      <button
        onClick={() => setManagingClasses(true)}
        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-colors"
      >
        Manage Classes
      </button>
    </div>
  )

  const modals = (
    <>
      {editing && <EditModal student={editing} classes={classes} onClose={() => setEditing(null)} />}
      {enrolling && <EnrollFaceModal student={enrolling} onClose={() => setEnrolling(null)} />}
      {adding && <AddStudentModal classes={classes} onClose={() => setAdding(false)} />}
      {importing && <BulkImportModal onClose={() => setImporting(false)} />}
      {managingClasses && <ManageClassesModal classes={classes} onClose={() => setManagingClasses(false)} />}
    </>
  )

  if (students.length === 0) {
    return (
      <>
        {modals}
        {toolbar}
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
          <p className="text-on-surface-variant text-sm">No students enrolled yet.</p>
          <p className="text-on-surface-variant text-xs mt-2">Add one, or bulk import a CSV, using the buttons above.</p>
        </div>
      </>
    )
  }

  return (
    <>
      {modals}
      {toolbar}

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-160">
          <thead>
            <tr className="text-on-surface-variant border-b border-outline-variant">
              <th className="text-left px-6 py-4 w-14"></th>
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4 hidden md:table-cell">Student ID</th>
              <th className="text-left px-6 py-4 hidden sm:table-cell">Class</th>
              <th className="text-left px-6 py-4">Gate Code</th>
              <th className="text-left px-6 py-4 hidden lg:table-cell">Code Year</th>
              <th className="text-left px-6 py-4 hidden lg:table-cell">Parent Phone</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-surface-container-high/50 transition-colors">
                <td className="px-6 py-4">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-base font-bold text-on-primary-container">
                      {s.name?.[0] ?? '?'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">
                  <span>{s.name}</span>
                  {s.faceDescriptor && (
                    <span className="ml-2 text-xs text-primary" title="Face ID enrolled">⬡</span>
                  )}
                  {s.usesBus && (
                    <span className="ml-2 text-xs text-on-surface-variant" title="Uses school bus — exempt from the cutoff-time alert">🚌</span>
                  )}
                </td>
                <td className="px-6 py-4 text-on-surface-variant font-mono text-xs hidden md:table-cell">
                  {s.studentId ?? '—'}
                </td>
                <td className="px-6 py-4 text-on-surface-variant hidden sm:table-cell">
                  {s.studentClass ?? '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-lg font-bold tracking-widest text-primary">
                    {s.code ?? '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-xs hidden lg:table-cell">
                  {s.codeYear ?? '—'}
                </td>
                <td className="px-6 py-4 text-on-surface-variant hidden lg:table-cell">
                  {s.parent?.phone ?? <span className="text-on-surface-variant italic">not registered</span>}
                  {s.parent?.phoneVerified && (
                    <span className="ml-1.5 text-success" title="Parent phone verified via OTP">✓</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => setEnrolling(s)}
                      className="text-xs text-primary hover:opacity-80 font-semibold"
                    >
                      Face ID
                    </button>
                    <button
                      onClick={() => setEditing(s)}
                      className="text-xs text-primary hover:opacity-80 font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  )
}
