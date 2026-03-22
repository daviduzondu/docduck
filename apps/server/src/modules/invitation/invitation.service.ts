import { db } from "../../lib/kysely";
import { document_invitations } from "@/db/prisma/generated/types";
import { InsertableWithoutId } from "../../types/helpers";
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";

export async function createDocumentInvitations(invitees: Omit<InsertableWithoutId<document_invitations>, 'status'>[]) {

 // TODO: Refactor code to integrate with the email service
 // For prototyping purposes, invites will be auto-accepted until the email service is set up.

 // db.transaction().execute((trx) => {
 //  // const userIds = trx.selectFrom('user').where('user.email', 'in', invitees.map(i => i.email)).select('user.id')
 // })

 return await db.insertInto('document_invitations').values(invitees.map(i => ({ ...i, status: "ACCEPTED" }))).returning(['id']).execute();
}

export async function getInvitationDetails(invitationId: string) {
 return await db.selectFrom('document_invitations').select(['id', 'role', 'inviterId', 'status', 'email']).where('id', '=', invitationId).executeTakeFirstOrThrow(() => { throw new AppError("Failed to retrieve invitation", StatusCodes.NOT_FOUND) });
}

export async function acceptDocumentInvitation(invitationId: string, ctx: Express.Request['ctx']) {
 return await db.transaction().execute(async (trx) => {
  const invitation = await trx.selectFrom('document_invitations').where('document_invitations.id', '=', invitationId).select(['documentId', 'email', 'role', 'status']).executeTakeFirstOrThrow();

  await trx.updateTable("document_invitations").set({
   status: "ACCEPTED"
  }).where('documentId', '=', invitation.documentId).where('document_invitations.email', '=', invitation.email).returning(['document_invitations.email']).execute();

  const { role } = await trx.insertInto("permission").values({ role: invitation.role, documentId: invitation.documentId, userId: ctx!.user.id }).returning(['role']).executeTakeFirstOrThrow();

  return role;
 })
}