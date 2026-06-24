'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

function EditModal({ student, onClose }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(student.name)
  const [studentClass, setStudentClass] = useState(student.student_class ?? '')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const classChanged = studentClass.trim() !== (student.student_class ?? '')

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

export default function StudentsClient({ students }) {
  const [editing, setEditing] = useState(null)

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

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
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
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-base font-bold text-indigo-300">
                      {s.name?.[0] ?? '?'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs hidden md:table-cell">
                  {s.student_id ?? '—'}
                </td>
                <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                  {s.student_class ?? '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-lg font-bold tracking-widest text-indigo-400">
                    {s.code ?? '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs hidden lg:table-cell">
                  {s.code_year ?? '—'}
                </td>
                <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">
                  {s.parent_phone ?? <span className="text-gray-600 italic">not registered</span>}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setEditing(s)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
