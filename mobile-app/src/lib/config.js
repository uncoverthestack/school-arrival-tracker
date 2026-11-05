import * as SecureStore from 'expo-secure-store'

const KEY = 'gate-kiosk-config'

export async function getConfig() {
  const raw = await SecureStore.getItemAsync(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function saveConfig({ serverUrl, schoolKey }) {
  const normalized = serverUrl.trim().replace(/\/+$/, '')
  await SecureStore.setItemAsync(KEY, JSON.stringify({ serverUrl: normalized, schoolKey: schoolKey.trim() }))
}

export async function clearConfig() {
  await SecureStore.deleteItemAsync(KEY)
}
