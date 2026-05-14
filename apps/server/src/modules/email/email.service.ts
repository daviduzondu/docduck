import { EmailApiOptions, Resend } from 'resend'
import { ORPCError } from '@orpc/contract'
import { Queue, Worker } from 'bullmq'
import { redis } from '@/lib/config/misc'
import { db } from '@/db/kysely'

const resend = new Resend(process.env.RESEND_API_KEY)
export type Recipient = {
 email: string
 options: Required<Pick<EmailApiOptions, 'subject' | 'html'>>
}

export type MailerJobData = {
 documentId: string
 recipients: Recipient[]
}

export async function sendEmail(recipients: Recipient[]) {
 if (recipients.length === 0) return
 const { error } = await resend.batch.send(
  recipients.map((r) => ({
   from: `DocDuck <no-reply@${process.env.RESEND_DOMAIN}>`,
   to: r.email,
   subject: r.options.subject,
   html: r.options.html,
  }))
 )
 if (error)
  throw new ORPCError('INTERNAL_SERVER_ERROR', {
   message: 'Failed to send invitation email',
  })
 return true
}

export const emailQueue = new Queue<MailerJobData>('Mailer', {
 connection: redis,
})

export const emailWorker = new Worker<MailerJobData>(
 'Mailer',
 async (job) => {
  if (job.name === 'send-mail') {
   await sendEmail(job.data.recipients)
  }
 },
 {
  connection: redis,
 }
)

emailWorker.on('completed', (job) => {
 if (job.data.recipients.length > 0 && job.name === 'send-mail') {
  const documentId = job.data.documentId

  if (documentId) {
   db
    .updateTable('document_invitation')
    .set({
     emailStatus: 'SENT',
    })
    .where('documentId', '=', documentId)
    .where(
     'email',
     'in',
     job.data.recipients.map((j) => j.email)
    )
    .execute()
    .catch((err: unknown) => {
     console.error('Failed to update emailStatus to SENT', err)
    })
  }
 }
})

emailWorker.on('failed', (job) => {
 if (job && job.data.recipients.length > 0 && job.name === 'send-mail') {
  const documentId = job.data.documentId

  if (documentId) {
   db
    .updateTable('document_invitation')
    .set({
     emailStatus: 'FAILED',
    })
    .where('documentId', '=', documentId)
    .where(
     'email',
     'in',
     job.data.recipients.map((j) => j.email)
    )
    .execute()
    .catch((err: unknown) => {
     console.error('Failed to update emailStatus to FAILED', err)
    })
  }
 }
})

process.on('SIGTERM', () => {
 emailWorker
  .close()
  .then(() => {
   process.exit(0)
  })
  .catch((err: unknown) => {
   console.log(err)
  })
})
