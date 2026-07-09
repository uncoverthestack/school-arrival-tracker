import { supabase } from '@/lib/supabase'
import { getSchool } from '@/lib/schools'

export async function GET(request) {
  const apiKey = request.headers.get('x-api-key')
  const school = await getSchool(apiKey)
  if (!school) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('students')
    .select('id, name, code, student_id, student_class, photo_url, face_descriptor')
    .eq('school_id', school.id)
    .not('face_descriptor', 'is', null)

  return Response.json({ students: data ?? [] })
}
