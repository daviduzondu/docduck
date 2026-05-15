import { Recipient } from '@/modules/email/email.service'
import find from 'find-process'

export async function verifyMailpitInstance() {
 if (process.env.NODE_ENV === 'DEVELOPMENT') {
  const processList = await find('name', 'mailpit')
  if (processList.length === 0) {
   throw new Error('Mailpit not running.')
  }
 }
}

export async function sendMailpitMail(
 from: { name: string; email: string },
 recipients: Recipient[]
) {
 for (const recipient of recipients) {
  const postRequest = await fetch('http://localhost:8025/api/v1/send', {
   method: 'post',
   headers: {
    'content-type': 'application/json',
   },
   body: JSON.stringify({
    From: from,
    To: [
     {
      Email: recipient.email,
     },
    ],
    Subject: recipient.options.subject,
    HTML: recipient.options.html,
    Tags: [recipient.email],
   }),
  })
  if (postRequest.status !== 200) {
   const response = await postRequest.json()
   console.error('Failed to send', response)
   throw new Error('Failed to send Mailpit email')
  } else {
   return
  }
 }
}
