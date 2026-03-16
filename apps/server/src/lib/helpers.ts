import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as z from 'zod';
import { db } from './kysely';

export class AppError extends Error {
 statusCode: number;

 constructor(message: string, statusCode: number) {
  super(message);
  this.name = "AppError";
  this.statusCode = statusCode;

  Error.captureStackTrace?.(this, this.constructor);
 }
}

export const validateBody = (schema: z.ZodType) => async (req: Request, res: Response, next: NextFunction) => {
 validate(schema, req.body);
 next();
}

export const validate = (schema: z.ZodType, input: any) => {
 try {
  const result = schema.parse(input);
 } catch (error) {
  if (error instanceof z.ZodError) {
   throw new AppError(error.message, StatusCodes.BAD_REQUEST)
  }
 }
}

export async function verifyRole({ documentId, userId }: { documentId: string, userId: string }) {
 const document = await db.selectFrom('document').select(['visibility']).where('document.id', '=', documentId).executeTakeFirstOrThrow();
 if (document.visibility === 'PRIVATE' && !userId) throw new AppError("You must be signed in to perform this action", StatusCodes.UNAUTHORIZED);
 const permission = await db.selectFrom('permission').select(['documentId', 'role', 'userId']).where('userId', '=', userId).executeTakeFirstOrThrow(() => { throw new AppError("You do not have permission to view this document. Contact the document owner.", StatusCodes.UNAUTHORIZED) });
 return permission.role
}