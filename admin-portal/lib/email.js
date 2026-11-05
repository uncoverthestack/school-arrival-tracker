import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { ROOT_DOMAIN } from './domain'
import { resolveBrand } from './brands'

// Transactional email is brand-facing: a school on childmap.org must never receive
// mail signed DataOcelot Schools, or vice versa. Same registry the SMS sender uses.
function brandName(rootDomain = ROOT_DOMAIN) {
  return resolveBrand(rootDomain).name
}

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
      FromEmailAddress: process.env.SES_FROM_EMAIL || `${brandName()} <no-reply@${ROOT_DOMAIN}>`,
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
      <p style="margin-top:32px;font-size:12px;color:#888">${brandName()} — Student Arrival Tracking</p>
    </div>
  `
}

export async function sendSignupConfirmationEmail({ toEmail, schoolName, rootDomain = ROOT_DOMAIN }) {
  const subject = `${brandName(rootDomain)} — Registration received`
  const text = `Thanks for registering ${schoolName} with ${brandName(rootDomain)}. Your account is pending review and will be activated once your payment is confirmed by our team. We'll email you your portal address as soon as it's ready.`
  const html = layout('Registration received', `
    <p>Thanks for registering <strong>${schoolName}</strong> with ${brandName(rootDomain)}.</p>
    <p>Your account is pending review and will be activated once your payment is confirmed by our team. We'll email you your portal address as soon as it's ready.</p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendPaymentDueReminderEmail({ toEmail, schoolName, subdomain, daysLeft, paymentDueAt, rootDomain = ROOT_DOMAIN }) {
  const dueDate = new Date(paymentDueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const subject = daysLeft <= 0
    ? `${brandName(rootDomain)} — Payment overdue`
    : `${brandName(rootDomain)} — Payment due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
  const text = `${schoolName}'s ${brandName(rootDomain)} subscription is due on ${dueDate}. Please arrange payment to keep ${subdomain}.${ROOT_DOMAIN} active without interruption.`
  const html = layout('Payment reminder', `
    <p><strong>${schoolName}</strong>'s ${brandName(rootDomain)} subscription is due on <strong>${dueDate}</strong>.</p>
    <p>Please arrange payment to keep <span style="font-family:monospace">${subdomain}.${ROOT_DOMAIN}</span> active without interruption.</p>
    <p>If payment isn't received by the due date, portal access will be paused until renewal is approved.</p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendDemoRequestNotification({ firstName, lastName, phone, schoolName, schoolEmail, schoolAddress, rootDomain = ROOT_DOMAIN }) {
  const toEmail = process.env.SUPER_ADMIN_EMAIL
  if (!toEmail) return

  const subject = `${brandName(rootDomain)} — Demo request from ${schoolName}`
  const text = `${firstName} ${lastName} from ${schoolName} requested a demo.\nPhone: ${phone}\nSchool email: ${schoolEmail}\nSchool address: ${schoolAddress}`
  const html = layout('New demo request', `
    <p><strong>${firstName} ${lastName}</strong> from <strong>${schoolName}</strong> requested a demo.</p>
    <p>Phone: <a href="tel:${phone}">${phone}</a></p>
    <p>School email: <a href="mailto:${schoolEmail}">${schoolEmail}</a></p>
    <p>School address: ${schoolAddress}</p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendSupportMessageNotification({ name, email, schoolName, message, rootDomain = ROOT_DOMAIN }) {
  const toEmail = process.env.SUPER_ADMIN_EMAIL
  if (!toEmail) return

  const subject = `Childmap Support — message from ${name}${schoolName ? ` (${schoolName})` : ''}`
  const text = `${name} <${email}>${schoolName ? ` from ${schoolName}` : ''} sent a support message:\n\n${message}`
  const html = layout('New support message', `
    <p><strong>${name}</strong> ${schoolName ? `from <strong>${schoolName}</strong> ` : ''}sent a message via the support widget.</p>
    <p>Reply to: <a href="mailto:${email}">${email}</a></p>
    <p style="white-space:pre-wrap;border-left:3px solid #ddd;padding-left:12px;margin-top:16px">${message}</p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendPasswordResetEmail({ toEmail, schoolName, subdomain, token, rootDomain = ROOT_DOMAIN }) {
  const url = `https://${subdomain}.${rootDomain}/reset-password?token=${token}`
  const subject = `${brandName(rootDomain)} — Reset your password`
  const text = `A password reset was requested for ${schoolName}'s ${brandName(rootDomain)} account. Reset it here (expires in 1 hour): ${url}\n\nIf you didn't request this, you can ignore this email.`
  const html = layout('Reset your password', `
    <p>A password reset was requested for <strong>${schoolName}</strong>'s ${brandName(rootDomain)} account.</p>
    <p><a href="${url}" style="background:#124f8f;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Reset password</a></p>
    <p style="font-size:12px;color:#888">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendPaymentConfirmedEmail({ toEmail, schoolName, subdomain, isRenewal, rootDomain = ROOT_DOMAIN }) {
  const url = `https://${subdomain}.${rootDomain}`
  const subject = isRenewal ? `${brandName(rootDomain)} — Payment confirmed, access renewed` : `${brandName(rootDomain)} — You're approved!`
  const text = `${isRenewal ? 'Your payment was confirmed and access has been renewed.' : `${schoolName} is now approved on ${brandName(rootDomain)}.`} Your portal: ${url}`
  const html = layout(isRenewal ? 'Access renewed' : 'You\'re approved!', `
    <p>${isRenewal
      ? `Your payment was confirmed and access to <strong>${schoolName}</strong>'s portal has been renewed.`
      : `<strong>${schoolName}</strong> is now approved and active on ${brandName(rootDomain)}.`}</p>
    <p>Your portal URL:</p>
    <p><a href="${url}" style="font-family:monospace">${url}</a></p>
  `)
  await sendEmail({ to: toEmail, subject, html, text })
}
