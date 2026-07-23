import { getAdminSession } from '@/lib/session'
import { updateSchool } from '@/lib/repo/schools'

function validTime(hour, minute) {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 && Number.isInteger(minute) && minute >= 0 && minute <= 59
}

export async function PATCH(request) {
  const session = await getAdminSession()
  if (!session.schoolId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const arrivalHour = Number(body.arrivalCutoffHour)
  const arrivalMinute = Number(body.arrivalCutoffMinute)
  const departureHour = Number(body.departureCutoffHour)
  const departureMinute = Number(body.departureCutoffMinute)

  if (!validTime(arrivalHour, arrivalMinute)) {
    return Response.json({ error: 'Invalid arrival cutoff time' }, { status: 400 })
  }
  if (!validTime(departureHour, departureMinute)) {
    return Response.json({ error: 'Invalid departure cutoff time' }, { status: 400 })
  }

  const updated = await updateSchool(session.schoolId, {
    arrivalCutoffHour: arrivalHour,
    arrivalCutoffMinute: arrivalMinute,
    departureCutoffHour: departureHour,
    departureCutoffMinute: departureMinute,
  })
  return Response.json({ school: updated })
}
