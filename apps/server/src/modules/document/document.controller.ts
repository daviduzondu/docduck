import { Request, Response, NextFunction } from "express";
import { getDocumentsService } from "./document.service";
import * as z from 'zod';
import { getOrUpdateDocumentSchema } from "./document.validation";
import { StatusCodes } from "http-status-codes";

export async function getDocuments(req: Request<{}, {}, z.infer<typeof getOrUpdateDocumentSchema>>, res: Response, next: NextFunction) {
 const data = await getDocumentsService(req.body);
 res.status(StatusCodes.OK).json({ data });
}