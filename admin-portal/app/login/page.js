'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '../_components/AuthLayout'

const labelClass = 'block text-body-medium tracking-[0.25px] text-on-surface-variant mb-2'
const inputClass =
  'w-full h-12 px-4 py-3 rounded-sm bg-surface-container-lowest border border-outline-variant ' +
  'text-on-surface text-body-large tracking-[0.5px] outline-none ' +
  'focus:outline-2 focus:outline-primary focus:-outline-offset-1 focus:border-transparent'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolKey, setSchoolKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const keyFromUrl = params.get('key') ?? ''
    const cookieKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('school-key='))
      ?.split('=')[1] ?? ''
    setSchoolKey(decodeURIComponent(keyFromUrl || cookieKey))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, schoolKey })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className="text-headline-small text-on-surface">Welcome back</p>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          Sign in to your Childmap account
        </p>
      </div>

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

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="flex justify-end -mt-3">
          {/* Not wired to a real flow yet — no password-reset route exists. */}
          <button type="button" className="text-body-medium tracking-[0.25px] text-primary hover:opacity-80 transition-opacity">
            Forgot password?
          </button>
        </div>

        {error && <p className="text-error text-body-medium tracking-[0.25px] text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-body-medium tracking-[0.25px] text-on-surface-variant">
          New to Childmap?{' '}
          <Link href="/signup" className="text-primary font-medium hover:opacity-80 transition-opacity">Create account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
