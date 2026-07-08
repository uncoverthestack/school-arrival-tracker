'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '../_components/AuthLayout'

const labelClass = 'block text-body-medium tracking-[0.25px] text-on-surface-variant mb-2'
const inputClass =
  'w-full h-12 px-4 py-3 rounded-sm bg-surface-container-lowest border border-outline-variant ' +
  'text-on-surface text-body-large tracking-[0.5px] outline-none ' +
  'focus:outline-2 focus:outline-primary focus:-outline-offset-1 focus:border-transparent'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ schoolName: '', subdomain: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field) {
    return e => {
      const value = field === 'subdomain'
        ? e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '')
        : e.target.value
      setForm(f => ({ ...f, [field]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: form.schoolName,
          subdomain: form.subdomain,
          email: form.email,
          password: form.password
        })
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

      // Redirect to dashboard after successful signup
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
        <p className="text-headline-small text-on-surface">Create your school account</p>
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-1">
          Set up Attendance Guard for your school
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>School name</label>
          <input
            type="text"
            value={form.schoolName}
            onChange={set('schoolName')}
            placeholder="e.g. Greenfield Academy"
            required
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>School URL</label>
          <div className="flex items-center h-12 px-4 rounded-sm bg-surface-container-lowest border border-outline-variant focus-within:outline-2 focus-within:outline-primary focus-within:-outline-offset-1 focus-within:border-transparent">
            <input
              type="text"
              value={form.subdomain}
              onChange={set('subdomain')}
              placeholder="greenfield"
              required
              minLength={3}
              maxLength={32}
              className="bg-transparent outline-none flex-1 min-w-0 text-on-surface text-body-large tracking-[0.5px]"
            />
            <span className="text-body-medium tracking-[0.25px] text-on-surface-variant whitespace-nowrap">.dataocelotschools.com</span>
          </div>
          <p className="text-body-small tracking-[0.4px] text-on-surface-variant mt-1">Lowercase letters, numbers and hyphens only</p>
        </div>

        <div>
          <label className={labelClass}>Admin email</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="admin@yourschool.com"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Confirm password</label>
          <input
            type="password"
            value={form.confirm}
            onChange={set('confirm')}
            placeholder="Repeat password"
            required
            className={inputClass}
          />
        </div>

        {error && <p className="text-error text-body-medium tracking-[0.25px] text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-sm bg-primary text-on-primary font-medium text-label-large tracking-[0.1px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-body-medium tracking-[0.25px] text-on-surface-variant">
          Already set up?{' '}
          <Link href="/login" className="text-primary font-medium hover:opacity-80 transition-opacity">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
