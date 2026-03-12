import { NextFunction, Response, Request } from 'express';
import * as z from 'zod';

export class AppError extends Error {
 name = 'AppError';
 
 constructor({ message, code }: { message: string, code: number, }) {
  super(JSON.stringify({ message, code }));
 }
}

export const validateMiddleware = (schema: z.ZodType, reqKey: 'body' | 'query' | 'params') => (req: Request, res: Response, next: NextFunction) => {
 validate(schema, req[reqKey]);
 next()
}

export const validate = (schema: z.ZodType, input: any) => {
 const result = schema.parse(input);
}