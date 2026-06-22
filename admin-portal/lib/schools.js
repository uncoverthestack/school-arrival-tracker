import { supabase } from './supabase'

export async function getSchool(apiKey) {
  if (!apiKey) return null
  const { data } = await supabase
    .from('schools')
    .select('id, name')
    .eq('api_key', apiKey)
    .single()
  return data ?? null
}
