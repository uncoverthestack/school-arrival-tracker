// Brand registry. One notify Lambda serves both storefronts, so every message has to
// carry the identity of the domain the parent actually registered through — a Childmap
// parent must never receive an SMS signed "DataOcelot", and vice versa.
//
// Each brand resolves its sender ID, WhatsApp origination number and SMS provider from
// brand-suffixed env vars, falling back to the shared unsuffixed var and finally to a
// baked-in default. That ordering lets you run both brands off one set of credentials
// today and split them later without touching this file.

const BRANDS = {
  childmap: {
    key: 'childmap',
    // Matches the capitalisation used across the marketing site and the approved
    // sender ID — parents see this string both as the sender and in the message body.
    name: 'Childmap',
    // Longest-suffix matched against the incoming Host, so school subdomains
    // (greenfield.childmap.org) resolve to the same brand as the apex.
    domains: ['childmap.org', 'childmap.ng'],
    // Must match the sender ID approved on the SMS account byte for byte: Sendchamp
    // rejects anything else with "invalid sender name". 'ChildmapLTD' is exactly 11
    // characters, the GSM alphanumeric limit, so it survives senderIdFor()'s truncation.
    // The display name above is what parents read in the message body; this is only
    // what appears as the sender.
    defaultSenderId: 'ChildmapLTD'
  },
  dataocelot: {
    key: 'dataocelot',
    name: 'DataOcelot Schools',
    domains: ['dataocelotschools.com'],
    // Nigerian alphanumeric sender IDs are capped at 11 characters, so this is
    // deliberately shorter than the brand's display name.
    defaultSenderId: 'DataOcelot'
  }
}

const DEFAULT_BRAND_KEY = process.env.DEFAULT_BRAND || 'childmap'

/**
 * Resolves a brand from either an explicit brand key ("childmap") or a Host header
 * ("greenfield.dataocelotschools.com:443"). Unknown hosts — previews, localhost —
 * fall back to DEFAULT_BRAND rather than erroring, so a misconfigured preview still
 * delivers notifications instead of silently dropping them.
 */
export function resolveBrand(input) {
  if (!input) return BRANDS[DEFAULT_BRAND_KEY] ?? BRANDS.childmap

  const value = String(input).trim().toLowerCase()
  if (BRANDS[value]) return BRANDS[value]

  const host = value.split(':')[0]
  let match = null
  for (const brand of Object.values(BRANDS)) {
    for (const domain of brand.domains) {
      if ((host === domain || host.endsWith(`.${domain}`)) && (!match || domain.length > match.domain.length)) {
        match = { brand, domain }
      }
    }
  }

  return match ? match.brand : (BRANDS[DEFAULT_BRAND_KEY] ?? BRANDS.childmap)
}

/** Reads BRAND-suffixed env first, then the shared one, then the supplied fallback. */
export function brandEnv(brand, name, fallback) {
  const suffix = brand.key.toUpperCase()
  return process.env[`${name}_${suffix}`] || process.env[name] || fallback
}

export function senderIdFor(brand) {
  // 11 chars is the GSM alphanumeric sender ID limit; over-long IDs are rejected
  // at submission by most Nigerian aggregators.
  return brandEnv(brand, 'SENDER_ID', brand.defaultSenderId).slice(0, 11)
}

export const brandKeys = Object.keys(BRANDS)
