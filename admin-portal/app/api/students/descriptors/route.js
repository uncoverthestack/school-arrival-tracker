import { getSchool } from '@/lib/schools'
import { getEnrolledFaceDescriptors } from '@/lib/repo/students'

export async function GET(request) {
  const apiKey = request.headers.get('x-api-key')
  const school = await getSchool(apiKey)
  if (!school) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const students = await getEnrolledFaceDescriptors(school.id)
  return Response.json({ students })
}
