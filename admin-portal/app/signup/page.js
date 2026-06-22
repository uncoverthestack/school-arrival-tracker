'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create School Account</h1>
          <p className="text-gray-400 text-sm mt-2">Set up your school&apos;s arrival tracking portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">School Name</label>
            <input
              type="text"
              value={form.schoolName}
              onChange={set('schoolName')}
              placeholder="e.g. Greenfield Academy"
              required
              autoFocus
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">School URL</label>
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-indigo-500">
              <input
                type="text"
                value={form.subdomain}
                onChange={set('subdomain')}
                placeholder="greenfield"
                required
                minLength={3}
                maxLength={32}
                className="bg-transparent outline-none flex-1 min-w-0"
              />
              <span className="text-gray-500 text-sm whitespace-nowrap">.schoolpass.com</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Lowercase letters, numbers and hyphens only</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Admin Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="admin@yourschool.com"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat password"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold transition-colors"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
          </p>
        </form>

      </div>
    </div>
  )
}
