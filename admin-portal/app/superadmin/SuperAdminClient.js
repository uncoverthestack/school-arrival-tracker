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

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function PaymentBadge({ school }) {
  if (school.status === 'pending') {
    const hours = school.pendingExpiresAt
      ? Math.max(0, Math.ceil((new Date(school.pendingExpiresAt) - new Date()) / (1000 * 60 * 60)))
      : null
    const expired = hours !== null && hours === 0
    return (
      <span className={`text-xs font-medium ${expired ? 'text-red-400' : 'text-blue-400'}`}>
        {expired ? 'Reservation expired' : hours !== null ? `Expires in ${hours}h` : 'Awaiting approval'}
      </span>
    )
  }
  if (school.status === 'payment_due') {
    const days = daysUntil(school.paymentDueAt)
    const overdue = days !== null ? Math.abs(days) : '?'
    return <span className="text-xs text-red-400 font-medium">Overdue {overdue}d</span>
  }
  if (school.status === 'active' && school.paymentDueAt) {
    const days = daysUntil(school.paymentDueAt)
    if (days === null) return null
    const color = days <= 7 ? 'text-orange-400' : 'text-gray-500'
    return <span className={`text-xs font-medium ${color}`}>{days}d left</span>
  }
  return null
}

function StatusBadge({ status }) {
  const styles = {
    pending:     'bg-blue-900 text-blue-400',
    active:      'bg-green-900 text-green-400',
    payment_due: 'bg-red-900 text-red-400',
    suspended:   'bg-yellow-900 text-yellow-400',
    archived:    'bg-gray-800 text-gray-500',
  }
  const labels = {
    pending:     'pending',
    active:      'active',
    payment_due: 'payment due',
    suspended:   'suspended',
    archived:    'archived',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? 'bg-gray-800 text-gray-400'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading, extra }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-4">{message}</p>
        {extra}
        <div className="flex gap-3 mt-6">
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

function SchoolRow({ school, onAction, rootDomain }) {
  const actionMap = {
    pending:     [{ label: 'Approve', action: 'approve', style: 'text-green-500 hover:text-green-400' },
                  { label: 'Reject',  action: 'reject',  style: 'text-red-500 hover:text-red-400' }],
    active:      [{ label: 'Suspend', action: 'suspend', style: 'text-yellow-500 hover:text-yellow-400' },
                  { label: 'Archive', action: 'archive', style: 'text-gray-500 hover:text-gray-400' }],
    payment_due: [{ label: 'Approve Renewal', action: 'approve', style: 'text-green-500 hover:text-green-400' },
                  { label: 'Archive', action: 'archive', style: 'text-gray-500 hover:text-gray-400' }],
    suspended:   [{ label: 'Restore', action: 'restore', style: 'text-green-500 hover:text-green-400' },
                  { label: 'Archive', action: 'archive', style: 'text-gray-500 hover:text-gray-400' }],
    archived:    [{ label: 'Restore', action: 'restore', style: 'text-green-500 hover:text-green-400' },
                  { label: 'Delete forever', action: 'delete', style: 'text-red-500 hover:text-red-400' }],
  }

  return (
    <tr className="hover:bg-gray-800/40 transition-colors">
      <td className="px-6 py-4">
        <p className="font-semibold">{school.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{school.subdomain}.{rootDomain}</p>
        {school.schoolType && (
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-xs bg-gray-800 text-gray-400 capitalize">
            {school.schoolType === 'combined' ? 'Primary + Secondary' : school.schoolType}
          </span>
        )}
      </td>
      <td className="px-6 py-4 hidden sm:table-cell text-gray-400 text-sm">{school.adminEmail}</td>
      <td className="px-6 py-4 hidden md:table-cell text-gray-400">{school.studentCount}</td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="flex flex-col gap-1">
          <StatusBadge status={school.status} />
          <PaymentBadge school={school} />
        </div>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">
        {new Date(school.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 justify-end">
          {(actionMap[school.status] ?? []).map(a => (
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

export function SchoolsTable({ schools, rootDomain }) {
  const router = useRouter()
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState(null) // { school, action }
  const [paymentDays, setPaymentDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const tabs = [
    { key: 'pending',     label: 'Pending' },
    { key: 'active',      label: 'Active' },
    { key: 'payment_due', label: 'Payment Due' },
    { key: 'suspended',   label: 'Suspended' },
    { key: 'archived',    label: 'Archived' },
  ]

  const filtered = schools.filter(s => s.status === tab)

  const confirmConfig = {
    reject: {
      title: 'Reject Registration',
      message: `This will permanently remove ${pending?.school.name}'s registration and free their subdomain immediately. They will need to sign up again.`,
      confirmLabel: 'Reject & Delete',
      confirmClass: 'bg-red-700 hover:bg-red-600 text-white',
    },
    approve: {
      title: pending?.school.status === 'payment_due' ? 'Approve Renewal' : 'Approve School',
      message: pending?.school.status === 'payment_due'
        ? `Renew access for ${pending?.school.name}. Set how many days until their next payment is due.`
        : `Grant ${pending?.school.name} full portal access. Set how many days until their first payment is due.`,
      confirmLabel: 'Approve',
      confirmClass: 'bg-green-700 hover:bg-green-600 text-white',
    },
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
      message: `${pending?.school.name} will be archived. All data is preserved and can be restored later.`,
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
    } else if (action === 'reject') {
      await fetch(`/api/superadmin/schools?id=${school.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      })
    } else {
      await fetch(`/api/superadmin/schools?id=${school.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, paymentDays: action === 'approve' ? paymentDays : undefined })
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
          extra={pending.action === 'approve' ? (
            <div className="mt-2">
              <label className="text-xs text-gray-400 block mb-1">Days until next payment due</label>
              <input
                type="number"
                min={1}
                max={365}
                value={paymentDays}
                onChange={e => setPaymentDays(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-500"
              />
            </div>
          ) : null}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {tabs.map(t => {
          const count = schools.filter(s => s.status === t.key).length
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {t.label}{count > 0 && <span className="ml-1 text-xs opacity-60">({count})</span>}
            </button>
          )
        })}
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No {tab.replace('_', ' ')} schools.
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-125">
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
                <SchoolRow key={s.id} school={s} rootDomain={rootDomain}
                  onAction={(school, action) => setPending({ school, action })} />
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  )
}
