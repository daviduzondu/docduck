import { Request, Response, NextFunction } from "express";
import z from 'zod';
import { getDocumentSchema } from "../modules/document/document.validation";
import { Insertable } from "kysely";

export type MiddlewareArgs<P = {}, Q = {}, B = {}> = [req: Request<P, Q, B>, res: Response, next: NextFunction];

export type InsertableWithoutId<T> = Omit<Insertable<T>, 'id'>;
