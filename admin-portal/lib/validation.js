// Permissive phone check for the dashboard's "Needs attention" flag — not
// enforced at signup/student-entry, just used to surface obviously broken
// numbers (empty, too short, or containing letters) to the school admin.
export function isValidPhone(phone) {
  if (!phone) return false
  const digits = String(phone).replace(/[^\d]/g, '')
  return digits.length >= 10 && digits.length <= 15
}
