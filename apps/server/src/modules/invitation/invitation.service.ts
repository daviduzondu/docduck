import { db } from "@/lib/kysely";
import { document_invitation } from "@/db/prisma/generated/types";
import { AppError } from "@/lib/helpers";
import { StatusCodes } from "http-status-codes";
import { Insertable, sql } from "kysely";
import { User } from "better-auth";
import { sendEmail } from "@/modules/email/email.service";
import { ProcedureErrorMap } from "@/types/types";
import { invitationEmailHtml } from "@repo/transactional/new-invitation";
import { isEqual } from "date-fns";

export async function addDocInvitees(documentId: string, invitees: Pick<Insertable<document_invitation>, 'email' | 'inviterId' | 'role'>[], user: User, errors: ProcedureErrorMap) {
 const { title } = await db.selectFrom('document').select(['title']).where('document.id', '=', documentId).executeTakeFirstOrThrow();


 if (invitees.some(i => i.email === user.email)) {
  throw errors.CONFLICT({ message: "You already own this document" });
 }

 const results = await db.insertInto('document_invitation').values(invitees.map(i => ({ ...i, documentId }))).returning(eb => ['email', 'status', 'document_invitation.id', 'document_invitation.createdAt', 'document_invitation.updatedAt']).onConflict((oc) => {
  return oc.columns(['email', 'documentId'])
   .where((eb) => eb.or([
    eb('status', '=', 'PENDING'),
    eb('status', '=', 'ACCEPTED')
   ]).and('revokedAt', 'is', null))
   .doUpdateSet((eb) => ({
    role: eb.ref('excluded.role')
   })).where(eb => eb('document_invitation.status', '=', 'PENDING')
    .and('document_invitation.revokedAt', 'is', null)
    .and('document_invitation.acceptedAt', 'is', null)
   )
 })
  .execute();

 const emails = (await Promise.all(
  invitees.map(async (i) => {
   const result = results.find(r => r.email === i.email);
   if (result?.id) {
    const inviteUrl = new URL('/invite/accept', process.env.FRONTEND_URL);
    inviteUrl.searchParams.set('token', result.id);
    const finalUrl = inviteUrl.toString();
    return {
     email: i.email,
     options: {
      subject:
       (isEqual(result?.createdAt, result?.updatedAt) ? "" : "Reminder: ") +
       "You've been invited to collaborate on a document",
      html: await invitationEmailHtml({
       documentTitle: title,
       inviterName: user.name,
       inviteUrl: finalUrl
      })
     }
    };
   }
  })
 ));

 await sendEmail(emails.filter(e => e !== undefined));

 return {
  invited: results.map(r => ({ ...r, id: undefined })),
  skipped: invitees.filter(i => !results.map(r => r.email).includes(i.email))
 }
}

export async function getInvitationDetails(invitationId: string) {
 return await db.selectFrom('document_invitation').select(['id', 'role', 'inviterId', 'status', 'email']).where('id', '=', invitationId).executeTakeFirstOrThrow(() => { throw new AppError("Failed to retrieve invitation", StatusCodes.NOT_FOUND) });
}

export async function acceptDocumentInvitation(invitationId: string, ctx: Express.Request['ctx'], errors: ProcedureErrorMap) {
 return await db.transaction().execute(async (trx) => {
  const invitation = await trx.selectFrom('document_invitation').where('document_invitation.id', '=', invitationId).select(['documentId', 'email', 'role', 'status', 'document_invitation.revokedAt']).executeTakeFirstOrThrow(() => {
   throw errors.NOT_FOUND({
    message: "This invitation does not exist."
   })
  });

  if (invitation.revokedAt !== null) {
   throw errors.FORBIDDEN({
    message: "You cannot accept this invitation because this link has been revoked."
   })
  }

  const updateTableResult = await trx.updateTable("document_invitation").set({
   status: "ACCEPTED",
   acceptedAt: sql`now()`
  })
   .where('documentId', '=', invitation.documentId)
   .where('document_invitation.email', '=', invitation.email)
   .where('acceptedAt', 'is', null)
   .where('status', '=', 'PENDING')
   .where('revokedAt', 'is', null)
   .returningAll().executeTakeFirst();

  if (updateTableResult?.email) {
   console.log(updateTableResult)
   const inserted = await trx.insertInto("permission").values({ role: invitation.role, documentId: invitation.documentId, userId: ctx!.user.id }).returning(['role', 'documentId']).onConflict((oc) => {
    return oc.columns(['documentId', 'userId']).doNothing();
   }).executeTakeFirstOrThrow();
   if (!inserted) {
    throw errors.CONFLICT({
     message: "Permission already exists for this user"
    });
   }
   return { role: inserted.role, documentId: inserted.documentId };
  } else {

   throw errors.CONFLICT({
    message: "You've already accepted this invitation"
   })
  }

 })
}