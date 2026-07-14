import { getAdminSession } from '@/lib/session'
import { getClassesBySchool, isClassTaken, createClass, deleteClass } from '@/lib/repo/classes'

export async function GET() {
  const session = await getAdminSession()
  if (!session.schoolId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const classes = await getClassesBySchool(session.schoolId)
  return Response.json({ classes })
}

export async function POST(request) {
  const session = await getAdminSession()
  if (!session.schoolId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const level = String(body.level ?? '').trim().toUpperCase()
  const arm = String(body.arm ?? '').trim().toUpperCase()

  if (!level || !arm) {
    return Response.json({ error: 'level and arm are required' }, { status: 400 })
  }

  if (await isClassTaken(session.schoolId, level, arm)) {
    return Response.json({ error: `${level}${arm} already exists` }, { status: 409 })
  }

  const created = await createClass({ schoolId: session.schoolId, level, arm })
  return Response.json({ class: created }, { status: 201 })
}

export async function DELETE(request) {
  const session = await getAdminSession()
  if (!session.schoolId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  await deleteClass(id, session.schoolId)
  return Response.json({ success: true })
}
