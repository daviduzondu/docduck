import * as documentService from "./document.service";
import * as z from 'zod';
import { createDocumentSchema, getDocumentSchema } from "./document.validation";
import { StatusCodes } from "http-status-codes";
import { MiddlewareArgs } from "../../types/helpers";

export async function getDocument(...[req, res]: MiddlewareArgs<{}, {}, z.infer<typeof getDocumentSchema>>) {
 const data = await documentService.getDocument(req.body);
 res.status(StatusCodes.OK).json({ data });
}

export async function createDocument(...[req, res]: MiddlewareArgs<{}, {}, z.infer<typeof createDocumentSchema>>) {
 const data = await documentService.createDocument({ ...req.body, ctx: req.ctx });
 res.status(StatusCodes.CREATED).json({
  documentId: data!.id
 })
}