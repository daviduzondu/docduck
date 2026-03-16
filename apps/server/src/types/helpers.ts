import { Request, Response, NextFunction } from "express";
import z from 'zod';
import { getDocumentSchema } from "../modules/document/document.validation";

export type MiddlewareArgs<P = {}, Q = {}, B = {}> = [req: Request<P, Q, B>, res: Response, next: NextFunction];
