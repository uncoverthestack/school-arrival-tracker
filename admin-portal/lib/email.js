import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const ses = new SESv2Client({
  region: process.env.SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  },
})

async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SES_ACCESS_KEY_ID) {
    console.warn('SES_ACCESS_KEY_ID not set — skipping email:', subject, '->', to)
    return
  }

  try {
    await ses.send(new SendEmailCommand({
      FromEmailAddress: process.env.SES_FROM_EMAIL || 'SchoolPass <no-reply@dataocelotschools.com>',
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
            Text: { Data: text, Charset: 'UTF-8' },
          },
        },
      },
    }))
  } catch (err) {
    console.error(`SES send failed (${subject} -> ${to}):`, err.message)
  }
}

function layout(title, bodyHtml) {
  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
      <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#888">SchoolPass — Student Arrival Tracking</p>
    </div>
  `
}

export async function sendSignupConfirmationEmail({ toEmail, schoolName }) {
  const subject = 'SchoolPass — Registration received'
  const text = `Thanks for registering ${schoolName} with SchoolPass. Your account is pending review and will be activated once your payment is confirmed by our team. We'll email you your portal address as soon as it's ready.`
  const html = layout('Registration received', `
    <p>Thanks for registering <strong>${schoolName}</strong> with SchoolPass.</p>
    <p>Your account is pending review and will be activated once your payment is confirmed by our team. We'll email you your portal address as soon as it's ready.</p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendPaymentDueReminderEmail({ toEmail, schoolName, subdomain, daysLeft, paymentDueAt }) {
  const dueDate = new Date(paymentDueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const subject = daysLeft <= 0
    ? 'SchoolPass — Payment overdue'
    : `SchoolPass — Payment due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
  const text = `${schoolName}'s SchoolPass subscription is due on ${dueDate}. Please arrange payment to keep ${subdomain}.dataocelotschools.com active without interruption.`
  const html = layout('Payment reminder', `
    <p><strong>${schoolName}</strong>'s SchoolPass subscription is due on <strong>${dueDate}</strong>.</p>
    <p>Please arrange payment to keep <span style="font-family:monospace">${subdomain}.dataocelotschools.com</span> active without interruption.</p>
    <p>If payment isn't received by the due date, portal access will be paused until renewal is approved.</p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendPaymentConfirmedEmail({ toEmail, schoolName, subdomain, isRenewal }) {
  const url = `https://${subdomain}.dataocelotschools.com`
  const subject = isRenewal ? 'SchoolPass — Payment confirmed, access renewed' : 'SchoolPass — You\'re approved!'
  const text = `${isRenewal ? 'Your payment was confirmed and access has been renewed.' : `${schoolName} is now approved on SchoolPass.`} Your portal: ${url}`
  const html = layout(isRenewal ? 'Access renewed' : 'You\'re approved!', `
    <p>${isRenewal
      ? `Your payment was confirmed and access to <strong>${schoolName}</strong>'s portal has been renewed.`
      : `<strong>${schoolName}</strong> is now approved and active on SchoolPass.`}</p>
    <p>Your portal URL:</p>
    <p><a href="${url}" style="font-family:monospace">${url}</a></p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}
