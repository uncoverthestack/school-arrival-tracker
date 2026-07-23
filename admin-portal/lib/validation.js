import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js'

// Numbers without a country code (e.g. "08064960219") are assumed Nigerian —
// matches how schools actually enter them. Numbers with a "+" prefix are
// validated against their own country regardless of this default.
const DEFAULT_COUNTRY = 'NG'

export function isValidPhone(phone) {
  if (!phone) return false
  try {
    return isValidPhoneNumber(String(phone).trim(), DEFAULT_COUNTRY)
  } catch {
    return false
  }
}

// Normalizes to E.164 (e.g. "+2348064960219") so the same number entered in
// different formats compares equal — this is the dedup key for parents.
// Returns null if the number isn't valid.
export function toE164(phone) {
  if (!phone) return null
  try {
    const parsed = parsePhoneNumberWithError(String(phone).trim(), DEFAULT_COUNTRY)
    return parsed?.isValid() ? parsed.number : null
  } catch {
    return null
  }
}
