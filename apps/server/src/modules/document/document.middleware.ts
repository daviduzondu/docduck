import { NextFunction, Request, Response } from "express";
import { db } from "@/lib/kysely";
import * as z from 'zod';
import { getDocumentSchema } from "./document.validation";
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";
import { MiddlewareArgs } from "../../types/helpers";

export const verifyDocumentAccess = async (req: Request<{}, {}, z.infer<typeof getDocumentSchema>>, res: Response, next: NextFunction) => {
 const isDocumentVisible = await db.selectFrom('document').select(['visibility', 'document.id']).where('id', '=', req.body.documentId).executeTakeFirstOrThrow();
 if (isDocumentVisible.visibility === 'PUBLIC') return next();
 if (!req.ctx?.user.id) throw new AppError("You must be signed in to perform this action.", StatusCodes.UNAUTHORIZED);

 const permission = await db.selectFrom('permission').select(['role', 'userId', 'documentId']).where('documentId', '=', req.body.documentId).where('permission.userId', '=', req.ctx.user.id).executeTakeFirst();
 if (permission) return next();

 throw new AppError("Sorry, you do not have access to one or more documents in this list", StatusCodes.FORBIDDEN);
}

export const isAuthenticated = async (...[req, res, next]: MiddlewareArgs) => {
 if (req.ctx?.session) return next();
 throw new AppError("You must be signed in to perform this action.", StatusCodes.UNAUTHORIZED);
}