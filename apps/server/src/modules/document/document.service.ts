import { db } from "@/lib/kysely";
import { NextFunction, Request, Response } from "express";
import { getOrUpdateDocumentSchema } from "./document.validation";
import * as z from 'zod';

export async function getDocumentsService(data: z.infer<typeof getOrUpdateDocumentSchema>) {
 return await db.selectFrom('document').where('document.id', 'in', data.documentIds).select(['id', 'title', 'visibility', 'ownerId']).executeTakeFirst();
}