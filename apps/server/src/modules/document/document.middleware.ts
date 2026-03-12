import { NextFunction, Request, Response } from "express";
import { db } from "@/lib/kysely";
import * as z from 'zod';
import { getDocumentSchema } from "./document.validation";

export async function verifyDocumentAccess(req: Request<{}, {}, z.infer<typeof getDocumentSchema>>, res: Response, next: NextFunction) {
 const isDocumentVisible = await db.selectFrom('document').select(['visibility']).where('id', 'in', req.body.documentIds).executeTakeFirstOrThrow();
 const permission = await db.selectFrom('permission').select(['role', 'userId', 'documentId']).where('documentId', 'in', req.body.documentIds).execute();
 return true;
}