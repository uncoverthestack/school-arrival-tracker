'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleLogout() {
    await fetch('/api/superadmin/logout', { method: 'POST' })
    startTransition(() => router.push('/superadmin/login'))
  }

  return (
    <button onClick={handleLogout} disabled={isPending}
      className="text-sm text-gray-400 hover:text-white transition-colors">
      Sign Out
    </button>
  )
}

function StatusBadge({ status }) {
  const styles = {
    active:    'bg-green-900 text-green-400',
    suspended: 'bg-yellow-900 text-yellow-400',
    archived:  'bg-gray-800 text-gray-500',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? styles.active}`}>
      {status}
    </span>
  )
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors disabled:bg-gray-800 disabled:text-gray-600 ${confirmClass}`}>
            {loading ? 'Please wait…' : confirmLabel}
          </button>
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function SchoolRow({ school, onAction }) {
  const actions = {
    active:    [{ label: 'Suspend', action: 'suspend', style: 'text-yellow-500 hover:text-yellow-400' },
                { label: 'Archive', action: 'archive', style: 'text-gray-500 hover:text-gray-400' }],
    suspended: [{ label: 'Restore', action: 'restore', style: 'text-green-500 hover:text-green-400' },
                { label: 'Archive', action: 'archive', style: 'text-gray-500 hover:text-gray-400' }],
    archived:  [{ label: 'Restore', action: 'restore', style: 'text-green-500 hover:text-green-400' },
                { label: 'Delete forever', action: 'delete', style: 'text-red-500 hover:text-red-400' }],
  }

  return (
    <tr className="hover:bg-gray-800/40 transition-colors">
      <td className="px-6 py-4">
        <p className="font-semibold">{school.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{school.subdomain}.dataocelotschools.com</p>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell text-gray-400 text-sm">{school.admin_email}</td>
      <td className="px-6 py-4 hidden md:table-cell text-gray-400">{school.studentCount}</td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <StatusBadge status={school.status} />
      </td>
      <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">
        {new Date(school.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 justify-end">
          {(actions[school.status] ?? []).map(a => (
            <button key={a.action} onClick={() => onAction(school, a.action)}
              className={`text-xs font-semibold ${a.style}`}>
              {a.label}
            </button>
          ))}
        </div>
      </td>
    </tr>
  )
}

export function SchoolsTable({ schools }) {
  const router = useRouter()
  const [tab, setTab] = useState('active')
  const [pending, setPending] = useState(null) // { school, action }
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const tabs = [
    { key: 'active',    label: 'Active' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'archived',  label: 'Archived' },
  ]

  const filtered = schools.filter(s => s.status === tab)

  const confirmConfig = {
    suspend: {
      title: 'Suspend School',
      message: `${pending?.school.name} will lose all access immediately. Their data stays intact and can be restored anytime.`,
      confirmLabel: 'Suspend',
      confirmClass: 'bg-yellow-700 hover:bg-yellow-600 text-white',
    },
    restore: {
      title: 'Restore School',
      message: `${pending?.school.name} will regain full access to their portal immediately.`,
      confirmLabel: 'Restore Access',
      confirmClass: 'bg-green-700 hover:bg-green-600 text-white',
    },
    archive: {
      title: 'Archive School',
      message: `${pending?.school.name} will be archived. All data is preserved and the school can be restored later by you.`,
      confirmLabel: 'Archive',
      confirmClass: 'bg-gray-700 hover:bg-gray-600 text-white',
    },
    delete: {
      title: 'Permanently Delete',
      message: `This will permanently delete all data for ${pending?.school.name} — students, arrivals, and all records. This cannot be undone.`,
      confirmLabel: 'Delete Forever',
      confirmClass: 'bg-red-700 hover:bg-red-600 text-white',
    },
  }

  async function handleConfirm() {
    if (!pending) return
    setLoading(true)

    const { school, action } = pending

    if (action === 'delete') {
      await fetch(`/api/superadmin/schools?id=${school.id}`, { method: 'DELETE' })
    } else {
      await fetch(`/api/superadmin/schools?id=${school.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
    }

    setLoading(false)
    setPending(null)
    startTransition(() => router.refresh())
  }

  const cfg = pending ? confirmConfig[pending.action] : null

  return (
    <>
      {pending && cfg && (
        <ConfirmModal
          {...cfg}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
          loading={loading || isPending}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map(t => {
          const count = schools.filter(s => s.status === t.key).length
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {t.label} {count > 0 && <span className="ml-1 text-xs opacity-60">({count})</span>}
            </button>
          )
        })}
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No {tab} schools.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left px-6 py-4">School</th>
                <th className="text-left px-6 py-4 hidden sm:table-cell">Admin Email</th>
                <th className="text-left px-6 py-4 hidden md:table-cell">Students</th>
                <th className="text-left px-6 py-4 hidden lg:table-cell">Status</th>
                <th className="text-left px-6 py-4 hidden lg:table-cell">Registered</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(s => (
                <SchoolRow key={s.id} school={s}
                  onAction={(school, action) => setPending({ school, action })} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
