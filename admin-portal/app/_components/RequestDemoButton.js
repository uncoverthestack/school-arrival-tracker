'use client'

import { useState } from 'react'

const inputClass =
  'w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm outline-none focus:border-primary'
const labelClass = 'block text-sm text-on-surface-variant mb-1'

function RequestDemoModal({ onClose }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolEmail, setSchoolEmail] = useState('')
  const [schoolAddress, setSchoolAddress] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/demo-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, phone, schoolName, schoolEmail, schoolAddress })
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-success-container flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l5 5L20 6" stroke="var(--color-on-success-container)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-title-medium text-on-surface font-semibold mb-1">Request received</p>
            <p className="text-body-medium text-on-surface-variant mb-6">
              We will contact you as soon as possible.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold transition-opacity hover:opacity-90"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-on-surface mb-1">Request a demo</h2>
            <p className="text-sm text-on-surface-variant mb-5">
              Tell us about your school and we&apos;ll reach out to set up a walkthrough.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Surname</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>School name</label>
                <input value={schoolName} onChange={e => setSchoolName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>School email address</label>
                <input type="email" value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>School address</label>
                <input value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} required className={inputClass} />
              </div>

              {error && <p className="text-error text-sm">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary disabled:opacity-50 font-bold transition-opacity hover:opacity-90"
                >
                  {submitting ? 'Sending…' : 'Send request'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export function RequestDemoButton({ className, children }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <RequestDemoModal onClose={() => setOpen(false)} />}
    </>
  )
}
