// Ported verbatim from admin-portal/app/gate/lib/useScanFlow.js — Intl-based,
// no native dependency, works unchanged under Hermes.

const ARRIVAL_CUTOFF_HOUR = 12

export function currentLagosHour() {
  return Number(new Date().toLocaleString('en-GB', {
    timeZone: 'Africa/Lagos', hour: 'numeric', hour12: false
  }))
}

export function deriveScanType() {
  return currentLagosHour() < ARRIVAL_CUTOFF_HOUR ? 'arrival' : 'departure'
}

export function currentLagosClock() {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit'
  })
}
