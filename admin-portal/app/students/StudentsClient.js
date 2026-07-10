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

function EditModal({ student, onClose }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(student.name)
  const [studentClass, setStudentClass] = useState(student.studentClass ?? '')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const classChanged = studentClass.trim() !== (student.studentClass ?? '')

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    const res = await fetch(`/api/students/${student.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), studentClass: studentClass.trim() })
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
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-1">Edit Student</h2>
        <p className="text-xs text-gray-500 mb-5">
          Changing the class will generate a new gate code (promotion).
          Keeping the same class preserves the code (repeating year).
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Class</label>
            <input
              value={studentClass}
              onChange={e => setStudentClass(e.target.value)}
              placeholder="e.g. JSS 2B"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
            {classChanged && (
              <p className="text-xs text-yellow-400 mt-1">Class changed → gate code will be rotated</p>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {result && <p className="text-green-400 text-sm font-mono">{result}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 font-bold transition-colors"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
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
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-1">Face ID — {student.name}</h2>
        <p className="text-xs text-gray-500 mb-5">
          {hasEnrolled
            ? 'This student already has a face enrolled. You can re-enroll or remove it.'
            : 'Enroll a face ID so this student can be recognised at the gate without a card or code.'}
        </p>

        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt={student.name}
            crossOrigin="anonymous"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-5 border-2 border-gray-700"
          />
        ) : (
          <p className="text-yellow-400 text-sm mb-5">
            No photo on file — upload a photo first, then enroll the face.
          </p>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
            <p className="text-sm text-gray-300">{message}</p>
          </div>
        )}
        {status === 'done' && <p className="text-green-400 text-sm mb-4">{message}</p>}
        {status === 'error' && <p className="text-red-400 text-sm mb-4">{message}</p>}

        <div className="flex flex-col gap-2">
          {student.photoUrl && (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={status === 'loading' || isPending}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 font-bold transition-colors"
            >
              {hasEnrolled ? 'Re-enroll Face' : 'Enroll Face'}
            </button>
          )}
          {hasEnrolled && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={status === 'loading' || isPending}
              className="w-full py-3 rounded-xl bg-red-900/50 hover:bg-red-900 text-red-400 font-semibold transition-colors disabled:opacity-40"
            >
              Remove Face Data
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'loading'}
            className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StudentsClient({ students }) {
  const [editing, setEditing] = useState(null)
  const [enrolling, setEnrolling] = useState(null)

  if (students.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center">
        <p className="text-gray-500 text-sm">No students enrolled yet.</p>
        <p className="text-gray-600 text-xs mt-2">Add students via the API: POST /api/students</p>
      </div>
    )
  }

  return (
    <>
      {editing && <EditModal student={editing} onClose={() => setEditing(null)} />}
      {enrolling && <EnrollFaceModal student={enrolling} onClose={() => setEnrolling(null)} />}

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-160">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
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
          <tbody className="divide-y divide-gray-800">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-base font-bold text-indigo-300">
                      {s.name?.[0] ?? '?'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">
                  <span>{s.name}</span>
                  {s.faceDescriptor && (
                    <span className="ml-2 text-xs text-indigo-400" title="Face ID enrolled">⬡</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs hidden md:table-cell">
                  {s.studentId ?? '—'}
                </td>
                <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                  {s.studentClass ?? '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-lg font-bold tracking-widest text-indigo-400">
                    {s.code ?? '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs hidden lg:table-cell">
                  {s.codeYear ?? '—'}
                </td>
                <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">
                  {s.parentPhone ?? <span className="text-gray-600 italic">not registered</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => setEnrolling(s)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Face ID
                    </button>
                    <button
                      onClick={() => setEditing(s)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
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
