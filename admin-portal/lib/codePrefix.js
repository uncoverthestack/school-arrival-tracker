// Short, human-readable prefix shown in front of a school's gate codes
// (e.g. "TA" -> "TA-482910"). Purely cosmetic — the stored/matched `code`
// value on a student is never touched by this: the kiosk's code pad
// (CodeEntryView) is a plain 6-digit numeric keypad, and /api/register
// looks a student up by their bare code with no school context (a parent
// typing their card's code doesn't send a school key) — baking a prefix
// into the actual matched value would break both without a much larger
// rework. Prefixing only what a human reads (the Students table, the
// gate's "entered code" readout) gets the same "looks branded to this
// school" effect with none of that risk.
//
// Because two schools can share similar names ("Test Academy" / "Trinity
// Academy" both initial to "TA"), the prefix is resolved once at school
// creation time — first school to register keeps the initials, later
// ones fall back down this list — and persisted on schools.codePrefix
// rather than recomputed live, so it can't shift under a school later.
function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 4)
}

function alphaOnly(name) {
  return name.replace(/[^a-zA-Z]/g, '').toUpperCase()
}

// Ordered from most- to least-distinctive. The caller tries each in turn
// against existing schools and takes the first free one; numbered variants
// only kick in once every plain option above them is already taken, and
// keep counting up so there's always eventually a free candidate.
export function* codePrefixCandidates(schoolName) {
  const name = String(schoolName ?? '').trim()
  if (!name) {
    yield 'SCH'
    for (let n = 2; ; n++) yield `SCH${n}`
  }

  const full = initials(name)
  const letters = alphaOnly(name)
  const first3 = letters.slice(0, 3)
  const first1 = letters.slice(0, 1)

  const base = full || first3 || first1 || 'SCH'
  if (full) yield full
  if (first3 && first3 !== full) yield first3
  if (first1 && first1 !== full && first1 !== first3) yield first1

  for (let n = 2; ; n++) yield `${base}${n}`
}

// Legacy helper kept for any display-only call site that just wants "the"
// prefix for a name with no uniqueness guarantee (e.g. formatting a code
// for a school record that predates the codePrefix column). Prefer reading
// school.codePrefix directly wherever a real school row is available.
export function deriveCodePrefix(schoolName) {
  return codePrefixCandidates(schoolName).next().value
}

export function formatDisplayCode(prefix, code) {
  if (!code) return code
  return prefix ? `${prefix}-${code}` : code
}
