'use client'

import { useMemo } from 'react'

// Splits a free-typed class value like "JSS1A" / "jss2b" into a normalized
// { level: 'JSS1', arm: 'B' } pair for grouping. Derived from whatever's
// actually on each student rather than the classes config table, so a Bulk
// Import or Google Form row that doesn't exactly match a configured class
// (different casing, etc.) still gets grouped sensibly instead of silently
// disappearing from a filter.
export function splitClass(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { level: 'Unassigned', arm: '' }
  const match = value.match(/^(.*?)([A-Za-z])$/)
  if (!match) return { level: value.toUpperCase(), arm: '' }
  return { level: match[1].toUpperCase(), arm: match[2].toUpperCase() }
}

const pillClass = (active) =>
  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
    active ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
  }`

// Two-level browse: pick a level (JSS1, JSS2...) to narrow, then optionally
// an arm (A, B, C) within it. Both rows are derived from `items` (anything
// with a `studentClass` field) rather than a fixed config, so a level/arm
// with nothing in it just doesn't show up as a button.
export function ClassFilter({ items, level, arm, onLevel, onArm }) {
  const byLevel = useMemo(() => {
    const map = new Map()
    for (const item of items) {
      const { level: l, arm: a } = splitClass(item.studentClass)
      if (!map.has(l)) map.set(l, new Set())
      if (a) map.get(l).add(a)
    }
    return map
  }, [items])

  const levels = useMemo(() => [...byLevel.keys()].sort(), [byLevel])
  const arms = level ? [...(byLevel.get(level) ?? [])].sort() : []

  if (levels.length <= 1) return null // nothing meaningful to browse by

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={pillClass(!level)} onClick={() => onLevel(null)}>All classes</button>
      {levels.map(l => (
        <button key={l} className={pillClass(level === l)} onClick={() => onLevel(l === level ? null : l)}>
          {l}
        </button>
      ))}
      {level && arms.length > 0 && (
        <>
          <span className="w-px h-5 bg-outline-variant mx-1" />
          <button className={pillClass(!arm)} onClick={() => onArm(null)}>All {level}</button>
          {arms.map(a => (
            <button key={a} className={pillClass(arm === a)} onClick={() => onArm(a === arm ? null : a)}>
              {level} {a}
            </button>
          ))}
        </>
      )}
    </div>
  )
}

// Filters `items` (anything with a `studentClass` field) down to the
// selected level/arm — pass level=null to mean "everything".
export function filterByClass(items, level, arm) {
  if (!level) return items
  return items.filter(item => {
    const { level: l, arm: a } = splitClass(item.studentClass)
    if (l !== level) return false
    if (arm && a !== arm) return false
    return true
  })
}
