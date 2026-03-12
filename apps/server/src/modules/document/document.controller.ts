import { Request, Response, NextFunction } from "express";
import { getDocumentsService } from "./document.service";
import * as z from 'zod';
import { getDocumentSchema } from "./document.validation";

export async function getDocumentsController(req: Request<{}, {}, z.infer<typeof getDocumentSchema>>, res: Response, next: NextFunction) {
 const result = await getDocumentsService(req.body);
}