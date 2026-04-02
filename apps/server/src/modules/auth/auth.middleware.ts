import { auth } from '@/modules/auth/better-auth';
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";
import { base } from "../../lib/os";
import { fromNodeHeaders } from 'better-auth/node';

export const ensureAuth = base.middleware(async ({ context, next }) => {
 const result = await auth.api.getSession({
  headers: fromNodeHeaders(context.req.headers),
 });

 if (!result) throw new AppError("You must be signed in to perform this action", StatusCodes.UNAUTHORIZED);

 return await next({
  context: result
 })
})