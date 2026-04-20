import { EmailApiOptions, Resend, } from 'resend';
import { ORPCError } from '@orpc/contract';

const resend = new Resend(process.env.RESEND_API_KEY);
type Recipent = {
 email: string;
 options: Required<Pick<EmailApiOptions, 'subject' | 'html'>>
}

export async function sendEmail(recipients: Recipent[]) {
 if (recipients.length === 0) return;
 const { error } = await resend.batch.send(recipients.map(r => ({
  from: `DocDuck <no-reply@${process.env.RESEND_DOMAIN}>`,
  to: r.email,
  subject: r.options.subject,
  html: r.options.html
 })));
 if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", {
  message: "Failed to send invitation email"
 });
 return;
}
