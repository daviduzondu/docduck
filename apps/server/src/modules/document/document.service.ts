import { db } from "@/lib/kysely";
import { NextFunction, Request, Response } from "express";
import { createDocumentSchema, getDocumentSchema } from "./document.validation";
import * as z from 'zod';

export async function getDocument(data: z.infer<typeof getDocumentSchema>) {
 return await db.selectFrom('document').where('document.id', 'in', data.documentId).select(['id', 'title', 'visibility', 'ownerId']).executeTakeFirst();
}

export async function createDocument(data: z.infer<typeof createDocumentSchema> & {
 ctx: Request["ctx"]
}) {
 return await db.insertInto('document').values({
  ownerId: data.ctx!.user.id,
  title: data.title
 }).returning(['id']).executeTakeFirst();
}