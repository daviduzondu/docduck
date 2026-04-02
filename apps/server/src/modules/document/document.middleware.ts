import { NextFunction, Request, Response } from "express";
import { db } from "@/lib/kysely";
import * as z from 'zod';
import { getDocumentSchema } from "./document.validation";
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";
import { MiddlewareArgs } from "../../types/types";
import { base } from "@/lib/os";

export const verifyDocumentAccess = async (req: Request<{}, {}, z.infer<typeof getDocumentSchema['body']>>, res: Response, next: NextFunction) => {
 const isDocumentVisible = await db.selectFrom('document').select(['visibility', 'document.id']).where('id', '=', req.body.documentId).executeTakeFirstOrThrow();
 if (isDocumentVisible.visibility === 'PUBLIC') return next();
 if (!req.ctx?.user.id) throw new AppError("You must be signed in to perform this action.", StatusCodes.UNAUTHORIZED);

 const permission = await db.selectFrom('permission').select(['role', 'userId', 'documentId']).where('documentId', '=', req.body.documentId).where('permission.userId', '=', req.ctx.user.id).executeTakeFirst();
 if (permission) return next();

 throw new AppError("Sorry, you do not have access to one or more documents in this list", StatusCodes.FORBIDDEN);
}

export const ensureDocumentOwner = base.middleware(async ({ context, next }) => {
 const { ownerId } = await db.selectFrom('document').where('document.id', '=', req.params.id).select(['ownerId']).executeTakeFirstOrThrow(() => new AppError("Document with id ${documentId} could not be found", StatusCodes.NOT_FOUND));

 if (ownerId !== req.ctx!.user.id) throw new AppError("You are not allowed to perform this action", StatusCodes.UNAUTHORIZED);
})



return next();
}


