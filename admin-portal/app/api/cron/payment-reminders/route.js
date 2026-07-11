import { supabase } from '@/lib/supabase'
import { sendPaymentDueReminderEmail } from '@/lib/email'

const REMINDER_WINDOW_DAYS = 3

export async function GET(request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, name, subdomain, admin_email, payment_due_at, payment_reminder_sent_at')
    .eq('status', 'active')
    .not('payment_due_at', 'is', null)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const now = new Date()
  const due = []
  for (const s of schools ?? []) {
    const dueAt = new Date(s.payment_due_at)
    const daysLeft = Math.ceil((dueAt - now) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0 || daysLeft > REMINDER_WINDOW_DAYS) continue

    const windowStart = new Date(dueAt.getTime() - REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    const alreadyReminded = s.payment_reminder_sent_at && new Date(s.payment_reminder_sent_at) >= windowStart
    if (alreadyReminded) continue

    due.push({ ...s, daysLeft })
  }

  for (const s of due) {
    await sendPaymentDueReminderEmail({
      toEmail: s.admin_email,
      schoolName: s.name,
      subdomain: s.subdomain,
      daysLeft: s.daysLeft,
      paymentDueAt: s.payment_due_at,
    })
    await supabase.from('schools').update({ payment_reminder_sent_at: now.toISOString() }).eq('id', s.id)
  }

  return Response.json({ reminded: due.map(s => s.subdomain) })
}
