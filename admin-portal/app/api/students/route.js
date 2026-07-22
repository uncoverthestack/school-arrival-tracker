import { getSchool } from '@/lib/schools'
import { getAdminSession } from '@/lib/session'
import { getStudentsBySchool, countStudentsBySchool, isCodeUnique, createStudent } from '@/lib/repo/students'

async function resolveSchool(request) {
  const session = await getAdminSession()
  if (session.schoolId) return { id: session.schoolId }
  const apiKey = request.headers.get('x-api-key')
  return getSchool(apiKey)
}

function currentSchoolYear() {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

export async function GET(request) {
  const school = await resolveSchool(request)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const students = await getStudentsBySchool(school.id)
  return Response.json({ students })
}

export async function POST(request) {
  const school = await resolveSchool(request)
  if (!school) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, studentClass, parentPhone, parentName, parentEmail, cardId, photoUrl, usesBus } = body

  if (!name || !studentClass || !parentPhone) {
    return Response.json(
      { error: 'name, studentClass, and parentPhone are required' },
      { status: 400 }
    )
  }

  const year = new Date().getFullYear()
  const count = await countStudentsBySchool(school.id)
  const seq = String(count + 1).padStart(4, '0')
  const studentId = `SCH-${year}-${seq}`

  let code
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    if (await isCodeUnique(candidate)) { code = candidate; break }
  }
  if (!code) {
    return Response.json({ error: 'Could not generate unique code, try again' }, { status: 500 })
  }

  const student = await createStudent({
    schoolId: school.id,
    studentId,
    name,
    studentClass,
    parentName: parentName ?? null,
    parentPhone,
    parentEmail: parentEmail ?? null,
    cardId: cardId ?? studentId,
    code,
    codeYear: currentSchoolYear(),
    photoUrl: photoUrl ?? null,
    usesBus: !!usesBus,
  })

  return Response.json({ student }, { status: 201 })
}
