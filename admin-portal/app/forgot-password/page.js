'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '../_components/AuthLayout'

const labelClass = 'block text-body-medium tracking-[0.25px] text-on-surface-variant mb-2'
const inputClass =
  'w-full h-12 px-4 py-3 rounded-sm bg-surface-container-lowest border border-outline-variant ' +
  'text-on-surface text-body-large tracking-[0.5px] ' +
  'focus:outline-2 focus:outline-primary focus:-outline-offset-1 focus:border-transparent'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      setSent(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className="text-headline-small text-on-surface">Reset your password</p>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          Enter your work email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="flex flex-col gap-5">
          <p className="text-body-medium tracking-[0.25px] text-on-surface">
            If that email is registered, a reset link is on its way. It expires in 1 hour.
          </p>
          <Link
            href="/login"
            className="w-full h-11 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px] flex items-center justify-center transition-opacity hover:opacity-90"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Work email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className={inputClass}
            />
          </div>

          {error && <p className="text-error text-body-medium tracking-[0.25px] text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <p className="text-center text-body-medium tracking-[0.25px] text-on-surface-variant">
            <Link href="/login" className="text-primary font-medium hover:opacity-80 transition-opacity">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
