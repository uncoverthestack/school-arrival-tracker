'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '../_components/AuthLayout'

const labelClass = 'block text-body-medium tracking-[0.25px] text-on-surface-variant mb-2'
const inputClass =
  'w-full h-12 px-4 py-3 rounded-sm bg-surface-container-lowest border border-outline-variant ' +
  'text-on-surface text-body-large tracking-[0.5px] ' +
  'focus:outline-2 focus:outline-primary focus:-outline-offset-1 focus:border-transparent'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // window only exists client-side, so the token can't be part of the
  // initial state — it has to be read after mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(params.get('token') ?? '')
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className="text-headline-small text-on-surface">Set a new password</p>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          Choose a new password for your account.
        </p>
      </div>

      {!token ? (
        <p className="text-error text-body-medium tracking-[0.25px] text-center">
          Missing reset link — check the URL or{' '}
          <Link href="/forgot-password" className="text-primary font-medium hover:opacity-80 transition-opacity">
            request a new one
          </Link>.
        </p>
      ) : done ? (
        <p className="text-body-medium tracking-[0.25px] text-on-surface text-center">
          Password updated. Redirecting to sign in…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          {error && <p className="text-error text-body-medium tracking-[0.25px] text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? 'Saving…' : 'Reset password'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
