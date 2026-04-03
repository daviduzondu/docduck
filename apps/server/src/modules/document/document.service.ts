import { db } from "@/lib/kysely";
import { Request } from "express";
import { createDocumentSchema, getDocumentSchema } from "./document.validation";
import * as z from 'zod';
import { AppError } from "@/lib/helpers";
import { StatusCodes } from "http-status-codes";

export async function getDocumentPermissions(id: string, userId: string | null = null) {
 //
 console.log(userId)
 return await db.selectFrom('document')
  .leftJoin('permission', (join) => join.onRef('permission.documentId', '=', 'document.id').on(eb => eb('permission.userId', '=', userId).or('permission.userId', 'is', null)))
  .where('document.id', '=', id)
  .select(['document.id as documentId', 'visibility', 'permission.role', 'permission.userId'])
  .executeTakeFirst();
}

export async function getDocument(data: z.infer<typeof getDocumentSchema>['params']) {
 return await db.selectFrom('document').where('document.id', '=', data.documentId).select(['id', 'title', 'visibility', 'ownerId']).executeTakeFirstOrThrow();
}

export async function createDocument(data: z.infer<typeof createDocumentSchema>, ctx: Request["ctx"]) {
 return await db.transaction().execute(async (trx) => {
  const { id: documentId } = await trx.insertInto('document').values({
   ownerId: ctx!.user.id,
   title: data.title
  }).returning(['id']).executeTakeFirstOrThrow(() => { throw new AppError("Failed to create document", StatusCodes.INTERNAL_SERVER_ERROR) });

  const { role } = await trx.insertInto('permission').values({
   documentId,
   role: "OWNER",
   userId: ctx!.user.id,
  }).returning(['role']).executeTakeFirstOrThrow(() => {
   throw new AppError("An error occured when generating permissions", StatusCodes.INTERNAL_SERVER_ERROR)
  });

  return { documentId, role }
 })
}