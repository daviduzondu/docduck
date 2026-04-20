import { Request, Response, NextFunction } from "express";
import z from 'zod';
import { getDocumentSchema } from "../modules/document/document.validation";
import { Insertable } from "kysely";
import { auth } from "@/modules/auth/better-auth";
import { MergedErrorMap, ORPCErrorConstructorMap } from "@orpc/server";
import { base } from "@/orpc/os";

type AtLeastOne<T, K extends keyof T = keyof T> =
 K extends keyof T
 ? Required<Pick<T, K>> & Partial<Omit<T, K>>
 : never;

export type MiddlewareArgs<P = {}, Q = {}, B = {}> = [req: Request<P, Q, B>, res: Response, next: NextFunction];

export type InsertableWithoutId<T> = Omit<Insertable<T>, 'id'>;

export type RequestSchema = AtLeastOne<{
 body: z.ZodObject,
 params: z.ZodObject,
 query: z.ZodObject
}>

export type AppContext = {
 req: Request
} & Partial<Awaited<ReturnType<typeof auth.api.getSession>>>;


export type ProcedureErrorMap<T extends typeof base = typeof base> = ORPCErrorConstructorMap<MergedErrorMap<Record<never, never>, T['~orpc']['errorMap']>>;