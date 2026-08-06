'use client'

import { useState } from 'react'

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
}

function formatFlaggedAt(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
  })
}

export default function WatchlistClient({ entries: initialEntries }) {
  const [entries, setEntries] = useState(initialEntries)
  const [resolving, setResolving] = useState(null)

  async function handleResolve(id) {
    setResolving(id)
    const res = await fetch(`/api/watchlist/${id}`, { method: 'PATCH' })
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== id))
    setResolving(null)
  }

  if (entries.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
        <p className="text-body-medium tracking-[0.25px] text-on-surface-variant py-2">
          Nothing on the watchlist right now.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col">
      {entries.map((e, i) => (
        <div
          key={e.id}
          className={`flex items-center gap-4 px-2 py-4 ${i < entries.length - 1 ? 'border-b border-outline-variant/50' : ''}`}
        >
          <div className="bg-primary-container flex items-center justify-center rounded-full size-10 shrink-0">
            <span className="text-label-large tracking-[0.1px] text-on-primary-container">
              {getInitials(e.studentName)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-large tracking-[0.5px] text-on-surface truncate">{e.studentName}</p>
            <p className="text-body-small tracking-[0.4px] text-on-surface-variant truncate">
              {e.studentClass} · flagged {formatFlaggedAt(e.flaggedAt)}
            </p>
          </div>
          <span
            className={`text-body-small rounded-full px-3 py-2 shrink-0 ${
              e.reason === 'not_arrived'
                ? 'bg-warning-container text-on-warning-container'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            {e.reason === 'not_arrived' ? 'Not checked in' : 'Not checked out'}
          </span>
          <button
            type="button"
            onClick={() => handleResolve(e.id)}
            disabled={resolving === e.id}
            className="shrink-0 text-label-large tracking-[0.1px] text-primary disabled:opacity-50 hover:opacity-80 transition-opacity"
          >
            {resolving === e.id ? 'Resolving…' : 'Resolve'}
          </button>
        </div>
      ))}
    </div>
  )
}
