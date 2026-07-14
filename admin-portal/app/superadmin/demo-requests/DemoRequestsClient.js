'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

function ContactedToggle({ request }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)

  async function toggle() {
    setSaving(true)
    await fetch(`/api/superadmin/demo-requests?id=${request.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacted: !request.contacted }),
    })
    setSaving(false)
    startTransition(() => router.refresh())
  }

  return (
    <button
      onClick={toggle}
      disabled={saving || isPending}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
        request.contacted
          ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
          : 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900'
      }`}
    >
      {request.contacted ? 'Contacted' : 'Not contacted'}
    </button>
  )
}

export function DemoRequestsTable({ demoRequests }) {
  if (demoRequests.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center">
        <p className="text-gray-500 text-sm">No demo requests yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-175">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4">School</th>
              <th className="text-left px-6 py-4 hidden md:table-cell">Contact</th>
              <th className="text-left px-6 py-4 hidden lg:table-cell">Address</th>
              <th className="text-left px-6 py-4 hidden sm:table-cell">Received</th>
              <th className="text-right px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {demoRequests.map(r => (
              <tr key={r.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">{r.firstName} {r.lastName}</td>
                <td className="px-6 py-4 text-gray-300">{r.schoolName}</td>
                <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                  <p>{r.phone}</p>
                  <p className="text-xs text-gray-500">{r.schoolEmail}</p>
                </td>
                <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">{r.schoolAddress}</td>
                <td className="px-6 py-4 text-gray-500 text-xs hidden sm:table-cell">
                  {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <ContactedToggle request={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
