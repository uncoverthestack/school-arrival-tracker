import { getAdminSession } from '@/lib/session'
import { getStudentById, updateStudent, deleteStudent, isCodeUnique } from '@/lib/repo/students'
import { deleteVerificationsByStudent } from '@/lib/repo/verifications'
import { deleteArrivalsByStudent } from '@/lib/repo/arrivals'

function currentSchoolYear() {
  const now = new Date()
  const year = now.getFullYear()
  return now.getMonth() >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

async function generateUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    if (await isCodeUnique(candidate)) return candidate
  }
  throw new Error('Could not generate unique code')
}

export async function PATCH(request, { params }) {
  const session = await getAdminSession()
  if (!session.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { studentClass, name, photoUrl, faceDescriptor, usesBus } = body

  const student = await getStudentById(id, session.schoolId)
  if (!student) {
    return Response.json({ error: 'Student not found' }, { status: 404 })
  }

  const updates = {}

  if (name) updates.name = String(name).trim().slice(0, 100)
  if (photoUrl !== undefined) updates.photoUrl = photoUrl || null
  if (usesBus !== undefined) updates.usesBus = !!usesBus
  if (faceDescriptor !== undefined) {
    updates.faceDescriptor = faceDescriptor ? JSON.stringify(Array.from(faceDescriptor)) : null
  }

  if (studentClass && studentClass !== student.studentClass) {
    updates.studentClass = studentClass
    updates.code = await generateUniqueCode()
    updates.codeYear = currentSchoolYear()
  } else if (studentClass && studentClass === student.studentClass) {
    updates.studentClass = studentClass
    updates.codeYear = currentSchoolYear()
  }

  const updated = await updateStudent(id, session.schoolId, updates)
  const rotated = 'code' in updates

  return Response.json({ student: updated, codeRotated: rotated })
}

export async function DELETE(_request, { params }) {
  const session = await getAdminSession()
  if (!session.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const student = await getStudentById(id, session.schoolId)
  if (!student) {
    return Response.json({ error: 'Student not found' }, { status: 404 })
  }

  await deleteVerificationsByStudent(id)
  await deleteArrivalsByStudent(id)
  await deleteStudent(id)

  return Response.json({ success: true })
}
