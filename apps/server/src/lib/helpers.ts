import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as z from 'zod';

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