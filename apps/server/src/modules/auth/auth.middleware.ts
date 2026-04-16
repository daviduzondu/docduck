import { auth } from '@/modules/auth/better-auth';
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";
import { base } from "../../orpc/os";
import { fromNodeHeaders } from 'better-auth/node';
import { AppContext } from '@/types/types';

export const ensureAuth = base.middleware(async ({ context, next, errors }) => {
 const result = await auth.api.getSession({
  headers: fromNodeHeaders(context.req.headers),
 });

 if (!result) throw errors.UNAUTHORIZED()

 return await next({
  context: { ...context, ...result }
 })
})

export const ctx = base.middleware(async ({ context, next }) => {
 const result = await auth.api.getSession({
  headers: fromNodeHeaders(context.req.headers),
 });

 return await next({
  context: { ...context, ...result }
 })
})