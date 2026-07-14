import { randomBytes } from 'crypto'
import { getAdminSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request) {
  const session = await getAdminSession()
  if (!session.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let form
  try {
    form = await request.formData()
  } catch {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!file || typeof file === 'string') {
    return Response.json({ error: 'file is required' }, { status: 400 })
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return Response.json({ error: 'Only JPEG, PNG, or WEBP images are allowed' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'Photo must be under 5MB' }, { status: 400 })
  }

  const path = `${session.schoolId}/${randomBytes(12).toString('hex')}.${ext}`

  const { error } = await supabase.storage
    .from('student-photos')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    return Response.json({ error: 'Upload failed. Try again.' }, { status: 500 })
  }

  const { data } = supabase.storage.from('student-photos').getPublicUrl(path)

  return Response.json({ photoUrl: data.publicUrl }, { status: 201 })
}
