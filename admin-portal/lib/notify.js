import { getRootDomain } from '@/lib/domain'
import { toE164 } from '@/lib/validation'
import { resolveBrand, sendSms } from '@/lib/sms'
import { recordSmsSubmitted } from '@/lib/repo/smsDeliveries'

/**
 * Set NOTIFICATIONS_DISABLED=true in environments that must never send SMS — the
 * preview deployment, where we test new features against test data and all real SMS
 * testing happens on production instead.
 *
 * This is an explicit opt-out rather than "no API key configured", because inferring
 * it from a missing key would make a genuine production misconfiguration look like a
 * deliberate choice: parents would silently stop receiving arrival alerts with
 * nothing failing. A missing key in a sending environment must still be an error.
 *
 * Sends become logged no-ops, so callers that write dependent state after a
 * successful notification (the cron alerts' watchlist entries and lastLateAlertDate
 * guards) still run, and preview behaves like production minus the SMS itself.
 */
const DISABLED = process.env.NOTIFICATIONS_DISABLED === 'true'

/**
 * Sends a parent alert over SMS. The brand is derived from the request Host so a parent
 * registered on dataocelotschools.com never gets a message signed Childmap (or vice
 * versa), falling back to ROOT_DOMAIN for cron-triggered sends with no request context.
 *
 * Throws on send failure: the scan paths fire-and-forget with .catch(console.error),
 * while the cron alerts log per-student and continue.
 */
async function sendAlert(phone, studentName, action, time, kind, schoolName) {
  const brand = resolveBrand(await getRootDomain())

  const to = toE164(phone)
  if (!to) {
    throw new Error(`Cannot notify ${studentName}'s parent: phone number on file is not valid`)
  }

  // Parents recognise their child's school, not the platform behind it, so the school
  // name leads. Falls back to the brand when a caller has no school in scope.
  const prefix = schoolName?.trim() || brand.name

  // The cutoff alerts already name their cutoff time inside `action`, so they pass
  // time=null rather than producing "... (cutoff 08:00) at 08:00."
  const text = `${prefix}: ${studentName} ${action}${time ? ` at ${time}` : ''}.`

  if (DISABLED) {
    console.log(`[notifications disabled] would send to ${to}: ${text}`)
    return { provider: 'disabled', messageId: null, skipped: true }
  }

  const { provider, messageId } = await sendSms({ to, text, brand })

  await logSubmission({ provider, messageId, brand: brand.key, phone: to, kind })
  return { provider, messageId }
}

/**
 * Records the provider's message id so the delivery webhook has a row to attach its
 * report to. Best-effort: the message is already with the provider by this point, so a
 * logging failure must not surface as a failed notification.
 */
async function logSubmission({ provider, messageId, brand, phone, kind }) {
  // Record the send even when the provider returns no message id. Sendchamp's success
  // response carries only counts and a business_id — no per-message identifier — so
  // skipping these would leave no record at all that a parent was notified. The row is
  // still worth having as an audit trail; what it cannot yet do is receive a delivery
  // report, since message_id is the key the webhook matches on.
  try {
    await recordSmsSubmitted({ provider, messageId, brand, phone, kind })
  } catch (err) {
    console.error('Failed to record SMS submission:', err)
  }
}

export async function notifyParent(phone, studentName, type, time, schoolName) {
  return sendAlert(phone, studentName, type === 'arrival' ? 'arrived at school' : 'left school', time, type, schoolName)
}

/**
 * Alerts a parent that their child hasn't been scanned in by the school's
 * arrival cutoff time. Not used for bus riders — their pickup schedule
 * doesn't follow a fixed gate time.
 */
export async function notifyParentAbsent(phone, studentName, cutoffTime, schoolName) {
  return sendAlert(phone, studentName, `has not arrived at school yet (cutoff ${cutoffTime})`, null, 'absent', schoolName)
}

/**
 * Alerts a parent that their child arrived today but hasn't been scanned out
 * by the school's departure cutoff time. Not used for bus riders.
 */
export async function notifyParentNotCheckedOut(phone, studentName, cutoffTime, schoolName) {
  return sendAlert(phone, studentName, `has not checked out of school yet (cutoff ${cutoffTime})`, null, 'not_checked_out', schoolName)
}

/** True when this environment cannot deliver an OTP, so the caller must surface it another way. */
export function notificationsDisabled() {
  return DISABLED
}

/** Sends a parent-registration OTP, branded to the domain they registered through. */
export async function sendOtpSms(phone, otp) {
  const brand = resolveBrand(await getRootDomain())
  const to = toE164(phone)
  if (!to) throw new Error('Cannot send OTP: invalid phone number')

  const text = `${brand.name}: Your verification code is ${otp}. Valid for 10 minutes.`

  if (DISABLED) {
    console.log(`[notifications disabled] would send OTP to ${to}`)
    return { provider: 'disabled', messageId: null, skipped: true }
  }

  const { provider, messageId } = await sendSms({ to, text, brand })

  await logSubmission({ provider, messageId, brand: brand.key, phone: to, kind: 'otp' })
  return { provider, messageId }
}
