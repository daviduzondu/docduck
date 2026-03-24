import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';
import { db } from './kysely';
import { createErrorMap, fromError } from 'zod-validation-error';

z.config({
 customError: createErrorMap()
})

export class AppError extends Error {
 statusCode: number;

 constructor(message: string, statusCode: number) {
  super(message);
  this.name = "AppError";
  this.statusCode = statusCode;

  Error.captureStackTrace?.(this, this.constructor);
 }
}

export const validateRequest = (schema: { query?: z.ZodType, body?: z.ZodType, params?: z.ZodType }) => async (req: Request, res: Response, next: NextFunction) => {
 if (schema.query) validate(schema.query, req.query);
 if (schema.body) validate(schema.body, req.body);
 if (schema.params) validate(schema.params, req.params);
 next();
}

export const validate = (schema: z.ZodType, input: any) => {
 try {
  schema.parse(input);
 } catch (error) {
  if (error instanceof z.ZodError) {
   throw new AppError(fromError(error).toString(), StatusCodes.BAD_REQUEST)
  }
  throw error;
 }
}

export async function verifyRole({ documentId, userId }: { documentId: string, userId: string }) {
 const document = await db.selectFrom('document').select(['visibility']).where('document.id', '=', documentId).executeTakeFirstOrThrow();
 if (document.visibility === 'PRIVATE' && !userId) throw new AppError("You must be signed in to perform this action", StatusCodes.UNAUTHORIZED);
 const permission = await db.selectFrom('permission').select(['documentId', 'role', 'userId']).where('userId', '=', userId).executeTakeFirstOrThrow(() => { throw new AppError("You do not have permission to view this document. Contact the document owner.", StatusCodes.UNAUTHORIZED) });
 return permission.role
}