import { getActiveSchoolsWithPaymentDue, updateSchool } from '@/lib/repo/schools'
import { sendPaymentDueReminderEmail } from '@/lib/email'

const REMINDER_WINDOW_DAYS = 3

export async function GET(request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const schools = await getActiveSchoolsWithPaymentDue()

  const now = new Date()
  const due = []
  for (const s of schools) {
    const dueAt = new Date(s.paymentDueAt)
    const daysLeft = Math.ceil((dueAt - now) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0 || daysLeft > REMINDER_WINDOW_DAYS) continue

    const windowStart = new Date(dueAt.getTime() - REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    const alreadyReminded = s.paymentReminderSentAt && new Date(s.paymentReminderSentAt) >= windowStart
    if (alreadyReminded) continue

    due.push({ ...s, daysLeft })
  }

  for (const s of due) {
    await sendPaymentDueReminderEmail({
      toEmail: s.adminEmail,
      schoolName: s.name,
      subdomain: s.subdomain,
      daysLeft: s.daysLeft,
      paymentDueAt: s.paymentDueAt,
    })
    await updateSchool(s.id, { paymentReminderSentAt: now })
  }

  return Response.json({ reminded: due.map(s => s.subdomain) })
}
