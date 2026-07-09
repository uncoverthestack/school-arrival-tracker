'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '../_components/AuthLayout'

const labelClass = 'block text-body-medium tracking-[0.25px] text-on-surface-variant mb-2'
const inputClass =
  'w-full h-12 px-4 py-3 rounded-sm bg-surface-container-lowest border border-outline-variant ' +
  'text-on-surface text-body-large tracking-[0.5px] outline-none ' +
  'focus:outline-2 focus:outline-primary focus:-outline-offset-1 focus:border-transparent'

const SCHOOL_TYPES = [
  { value: 'primary',   label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'combined',  label: 'Combined (Primary + Secondary)' },
  { value: 'nursery',   label: 'Nursery / Kindergarten' },
  { value: 'tertiary',  label: 'Tertiary / University' },
]

export default function SignupPage() {
  const [form, setForm] = useState({
    schoolName: '', subdomain: '', schoolType: 'primary', email: '', password: '', confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

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
          schoolType: form.schoolType,
          email: form.email,
          password: form.password
        })
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

      setSubmitted(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3Z" fill="currentColor" className="text-primary" fillOpacity="0.3"/>
              <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
            </svg>
          </div>
          <div>
            <p className="text-headline-small text-on-surface font-bold">Registration received</p>
            <p className="text-body-medium tracking-[0.25px] text-on-surface-variant mt-2">
              Your account for <strong>{form.subdomain}.dataocelotschools.com</strong> is under review.
              You will receive access once your payment is confirmed by our team.
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 text-left">
            <p className="text-body-small tracking-[0.4px] text-on-surface-variant">What happens next</p>
            <ul className="mt-2 flex flex-col gap-2">
              {['Our team reviews your registration', 'Payment is confirmed', 'Your portal goes live at your subdomain'].map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-body-medium tracking-[0.25px] text-on-surface">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/login" className="text-body-medium tracking-[0.25px] text-primary font-medium hover:opacity-80 transition-opacity">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
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
          <label className={labelClass}>School type</label>
          <select
            value={form.schoolType}
            onChange={set('schoolType')}
            className={inputClass}
          >
            {SCHOOL_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>School URL</label>
          <div className="flex items-center h-12 px-4 rounded-sm bg-surface-container-lowest border border-outline-variant focus-within:outline-2 focus-within:outline-primary focus-within:-outline-offset-1 focus-within:border-transparent">
            <input
              type="text"
              value={form.subdomain}
              onChange={set('subdomain')}
              placeholder="greenfield-primary"
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
