import { db } from "@/lib/kysely";
import { document_invitation } from "@/db/prisma/generated/types";
import { AppError } from "@/lib/helpers";
import { StatusCodes } from "http-status-codes";
import { Insertable, sql } from "kysely";
import { User } from "better-auth";

export async function addDocInvitees(documentId: string, invitees: Pick<Insertable<document_invitation>, 'email' | 'inviterId' | 'role'>[], user: User) {
 // TODO: Integrate email service
 if (invitees.some(i => i.email === user.email)) {
  throw new AppError("You already own this document. You cannot add yourself as a collaborator", StatusCodes.CONFLICT);
 }
 return await db.insertInto('document_invitation').values(invitees.map(i => ({ ...i, documentId }))).returning(['email']).onConflict((oc) => {
  return oc.columns(['email', 'documentId'])
   .where((eb) => eb.or([
    eb('status', '=', 'PENDING'),
    eb('status', '=', 'ACCEPTED')
   ]).and('revokedAt', 'is', null))
   .doUpdateSet((eb) => ({
    role: eb.ref('excluded.role')
   }));
 }).execute();
}

export async function getInvitationDetails(invitationId: string) {
 return await db.selectFrom('document_invitation').select(['id', 'role', 'inviterId', 'status', 'email']).where('id', '=', invitationId).executeTakeFirstOrThrow(() => { throw new AppError("Failed to retrieve invitation", StatusCodes.NOT_FOUND) });
}

export async function acceptDocumentInvitation(invitationId: string, ctx: Express.Request['ctx']) {
 return await db.transaction().execute(async (trx) => {
  const invitation = await trx.selectFrom('document_invitation').where('document_invitation.id', '=', invitationId).select(['documentId', 'email', 'role', 'status']).executeTakeFirstOrThrow();

  await trx.updateTable("document_invitation").set({
   status: "ACCEPTED",
   acceptedAt: sql`now()`
  })
   .where('documentId', '=', invitation.documentId)
   .where('document_invitation.email', '=', invitation.email)
   .where('acceptedAt', 'is', null)
   .where('status', '=', 'PENDING')
   .where('revokedAt', 'is', null)
   .returning(['document_invitation.email']).execute();

  const { role } = await trx.insertInto("permission").values({ role: invitation.role, documentId: invitation.documentId, userId: ctx!.user.id }).returning(['role']).onConflict((oc) => {
   oc.doNothing();
   throw new AppError("You've already accepted this invitation", StatusCodes.CONFLICT)
  }).executeTakeFirstOrThrow();

  return role;
 })
}