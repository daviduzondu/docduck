import { NextFunction, Request, Response } from "express";
import { auth } from '@/modules/auth/better-auth';
import { fromNodeHeaders } from "better-auth/node";
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";

export async function ctx(req: Request, res: Response, next: NextFunction) {
 const result = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers)
 });

 req.ctx = result;
 return next();
}

export async function authed(req: Request, res: Response, next: NextFunction) {
 if (!req.ctx?.session) throw new AppError("You must be authenticated to perform this action.", StatusCodes.UNAUTHORIZED);
}