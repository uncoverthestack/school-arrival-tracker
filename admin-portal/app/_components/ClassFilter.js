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
