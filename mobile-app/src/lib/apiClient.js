import { getConfig } from './config'

const TIMEOUT_MS = 8000

async function request(path, body) {
  const config = await getConfig()
  if (!config) return { error: 'unauthorized' }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${config.serverUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.schoolKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    return await res.json()
  } catch {
    throw new Error('network_error')
  } finally {
    clearTimeout(timeout)
  }
}

export const lookupStudent = (code) => request('/api/gate/lookup', { code })
export const scanCard = (cardId, type) => request('/api/gate/scan', { cardId, type })
