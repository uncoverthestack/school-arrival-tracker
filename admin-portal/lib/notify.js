const LAMBDA_URL = process.env.NOTIFY_LAMBDA_URL
const LAMBDA_API_KEY = process.env.NOTIFY_LAMBDA_API_KEY

/**
 * Fire SMS + WhatsApp via the notify Lambda (AWS SNS + AWS End User Messaging Social).
 */
export async function notifyParent(phone, studentName, type, time) {
  if (!LAMBDA_URL) {
    console.warn('NOTIFY_LAMBDA_URL not set — skipping notifications')
    return
  }

  const action = type === 'arrival' ? 'arrived at school' : 'left school'

  const res = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LAMBDA_API_KEY
    },
    body: JSON.stringify({ phone, studentName, action, time })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Lambda notify failed (${res.status}): ${text}`)
  }

  return res.json()
}

async function sendAlert(phone, studentName, action, time) {
  if (!LAMBDA_URL) {
    console.warn('NOTIFY_LAMBDA_URL not set — skipping notifications')
    return
  }

  const res = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LAMBDA_API_KEY
    },
    body: JSON.stringify({ phone, studentName, action, time })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Lambda notify failed (${res.status}): ${text}`)
  }

  return res.json()
}

/**
 * Alerts a parent that their child hasn't been scanned in by the school's
 * arrival cutoff time. Not used for bus riders — their pickup schedule
 * doesn't follow a fixed gate time.
 */
export async function notifyParentAbsent(phone, studentName, cutoffTime) {
  return sendAlert(phone, studentName, `has not arrived at school yet (cutoff ${cutoffTime})`, cutoffTime)
}

/**
 * Alerts a parent that their child arrived today but hasn't been scanned out
 * by the school's departure cutoff time. Not used for bus riders.
 */
export async function notifyParentNotCheckedOut(phone, studentName, cutoffTime) {
  return sendAlert(phone, studentName, `has not checked out of school yet (cutoff ${cutoffTime})`, cutoffTime)
}
