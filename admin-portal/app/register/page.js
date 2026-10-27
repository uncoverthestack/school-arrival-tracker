'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [step, setStep] = useState('form') // form | success
  const [code, setCode] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), parentName: parentName.trim(), parentPhone: parentPhone.trim() })
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

      setStudentName(data.student?.name ?? '')
      setStep('success')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">You&apos;re registered!</h1>
          <p className="text-gray-400">
            You will receive SMS notifications whenever <span className="text-white font-semibold">{studentName}</span> arrives at or leaves school.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Parent Registration</h1>
          <p className="text-gray-400 text-sm mt-2">
            Enter the student code and the phone number you provided to the school when enrolling your child.
          </p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Student Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code from school"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Name</label>
            <input
              type="text"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              placeholder="e.g. Mrs. Okafor"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone Number (WhatsApp)</label>
            <input
              type="tel"
              value={parentPhone}
              onChange={e => setParentPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-gray-600 mt-1">Must match the number you gave the school at enrolment</p>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold transition-colors"
          >
            {loading ? 'Sending code…' : 'Send Verification Code'}
          </button>
        </form>
      </div>
    </div>
  )
}
