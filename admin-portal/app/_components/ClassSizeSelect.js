'use client'

import { useMemo } from 'react'
import { splitClass } from './ClassFilter'

// A dropdown of every class/arm actually present among `items` (anything with
// a `studentClass` field), each option showing its own headcount, plus a live
// "N students in X" summary next to it — the quick way to answer "how many
// kids are in JSS1B" without scanning the whole table. Sized to match the
// toolbar buttons above it (px-4 py-2, rounded-xl, text-sm) rather than the
// taller form-style <select> used inside modals, since this is a compact
// page-level control, not a form field — and the native select arrow is
// swapped for a custom chevron so it doesn't look like a stray browser
// default next to everything else on the page.
export function ClassSizeSelect({ items, value, onChange }) {
  const groups = useMemo(() => {
    const counts = new Map()
    for (const item of items) {
      const { level, arm } = splitClass(item.studentClass)
      const key = `${level}${arm}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  if (groups.length <= 1) return null // nothing meaningful to break down

  const selectedCount = value ? (groups.find(([key]) => key === value)?.[1] ?? 0) : items.length

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value || null)}
          className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-sm font-semibold text-on-surface transition-colors cursor-pointer focus:outline-2 focus:outline-primary focus:-outline-offset-1"
        >
          <option value="">All classes</option>
          {groups.map(([key, count]) => (
            <option key={key} value={key}>{key} — {count} student{count === 1 ? '' : 's'}</option>
          ))}
        </select>
        <svg
          width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
        >
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary-container text-on-primary-container px-4 py-2 text-sm font-semibold">
        <span className="font-bold">{selectedCount}</span>
        student{selectedCount === 1 ? '' : 's'}{value ? ` in ${value}` : ' total'}
      </span>
    </div>
  )
}
