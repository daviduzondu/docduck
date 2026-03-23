import { NextFunction, Request, Response } from "express";
import { auth } from '@/modules/auth/better-auth';
import { fromNodeHeaders } from "better-auth/node";
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";
import { MiddlewareArgs } from "@/types/types";

export async function ctx(...[req, res, next]: MiddlewareArgs) {
 const result = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers)
 });

 req.ctx = result;
 return next();
}

export const ensureAuth = async (...[req, res, next]: MiddlewareArgs) => {
 if (req.ctx?.session) return next();
 throw new AppError("You must be signed in to perform this action.", StatusCodes.UNAUTHORIZED);
}

export const isResourceOwner = async (...[req, res, next]: MiddlewareArgs) => {
}
