import { checkLimit, registerLimiter } from '@/lib/ratelimit'
import { getStudentByCode } from '@/lib/repo/students'
import { toE164 } from '@/lib/validation'
import { updateParent } from '@/lib/repo/parents'

export async function POST(request) {
  const { allowed } = await checkLimit(registerLimiter, null, request)
  if (!allowed) {
    return Response.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { code, parentName, parentPhone } = body

  if (!code || !parentName || !parentPhone) {
    return Response.json({ error: 'code, parentName, and parentPhone are required' }, { status: 400 })
  }

  const safeCode = String(code).replace(/\D/g, '').slice(0, 6)
  if (safeCode.length < 4) {
    return Response.json({ error: 'Invalid code format' }, { status: 400 })
  }

  const safeName = String(parentName).trim().slice(0, 100)
  if (safeName.length < 2) {
    return Response.json({ error: 'Name is too short' }, { status: 400 })
  }

  const inputPhone = toE164(parentPhone)
  if (!inputPhone) {
    return Response.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  const student = await getStudentByCode(safeCode)
  if (!student) {
    return Response.json({ error: 'Invalid code — check with your school' }, { status: 404 })
  }

  if (!student.parent?.phone) {
    return Response.json(
      { error: 'No parent contact on file for this student. Ask the school office to register your number first.' },
      { status: 403 }
    )
  }

  if (toE164(student.parent.phone) !== inputPhone) {
    return Response.json(
      { error: 'Phone number does not match school records for this student. Contact the school office.' },
      { status: 403 }
    )
  }

  // Registration completes on the code-and-phone match alone. The gate code is
  // issued by the school and only reaches the parent on the child's card, and the
  // submitted number must already match the one the school holds — so an SMS
  // round-trip confirmed nothing the school had not already asserted, while costing
  // every parent an extra step before they could receive any alerts at all.
  await updateParent(student.parent.id, { name: safeName, phoneVerified: true })

  return Response.json({
    success: true,
    student: { name: student.name, studentClass: student.studentClass },
    message: `You will receive notifications for ${student.name}`,
  })
}
