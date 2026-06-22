import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { SocialMessagingClient, SendWhatsAppMessageCommand } from '@aws-sdk/client-socialmessaging'

const sns = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' })
const social = new SocialMessagingClient({ region: process.env.AWS_REGION || 'us-east-1' })

export const handler = async (event) => {
  const apiKey = event.headers?.['x-api-key'] ?? event.headers?.['X-Api-Key']
  if (apiKey !== process.env.NOTIFY_API_KEY) {
    return json(401, { error: 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const { phone, otp, studentName, action, time } = body
  if (!phone) {
    return json(400, { error: 'phone is required' })
  }

  const normalized = normalizePhone(phone)
  const results = {}

  // OTP path — phone verification for parent registration
  if (otp) {
    const smsText = `SchoolPass: Your verification code is ${otp}. Valid for 10 minutes.`
    await sns.send(new PublishCommand({
      PhoneNumber: normalized,
      Message: smsText,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
        'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: process.env.SENDER_ID || 'SchoolPass' }
      }
    }))
      .then(() => { results.sms = 'sent' })
      .catch(err => { results.sms = `failed: ${err.message}`; console.error('SNS OTP error:', err) })

    return json(200, { success: true, results })
  }

  if (!studentName || !action || !time) {
    return json(400, { error: 'phone, studentName, action, and time are required' })
  }

  const smsText = `SchoolPass: ${studentName} ${action} at ${time}.`

  // ── SMS via AWS SNS ──────────────────────────────────────────────────────────
  await sns.send(new PublishCommand({
    PhoneNumber: normalized,
    Message: smsText,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
      'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: process.env.SENDER_ID || 'SchoolPass' }
    }
  }))
    .then(() => { results.sms = 'sent' })
    .catch(err => { results.sms = `failed: ${err.message}`; console.error('SNS error:', err) })

  // ── WhatsApp via AWS End User Messaging Social ───────────────────────────────
  const phoneNumberId = process.env.AWS_WHATSAPP_PHONE_ID
  const templateName = process.env.AWS_WHATSAPP_TEMPLATE_NAME || 'school_arrival_notification'

  if (phoneNumberId) {
    const waMessage = {
      messaging_product: 'whatsapp',
      to: normalized,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: studentName },
              { type: 'text', text: action },
              { type: 'text', text: time }
            ]
          }
        ]
      }
    }

    await social.send(new SendWhatsAppMessageCommand({
      OriginationPhoneNumberId: phoneNumberId,
      Message: Buffer.from(JSON.stringify(waMessage)),
      MetaApiVersion: 'v20.0'
    }))
      .then(() => { results.whatsapp = 'sent' })
      .catch(err => { results.whatsapp = `failed: ${err.message}`; console.error('WhatsApp error:', err) })
  } else {
    results.whatsapp = 'skipped: AWS_WHATSAPP_PHONE_ID not set'
  }

  return json(200, { success: true, results })
}

function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`
  if (digits.startsWith('234')) return `+${digits}`
  if (!digits.startsWith('+')) return `+${digits}`
  return digits
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}
