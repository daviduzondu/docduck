import * as documentService from "./document.service";
import * as z from 'zod';
import * as documentSchema from "./document.validation";
import { StatusCodes } from "http-status-codes";
import { MiddlewareArgs } from "@/types/helpers";
import { createDocumentInvitations } from "@/modules/invitation/invitation.service"

export async function getDocument(...[req, res]: MiddlewareArgs<{}, {}, z.infer<typeof documentSchema.getDocumentSchema['body']>>) {
 const data = await documentService.getDocument(req.body);
 res.status(StatusCodes.OK).json({ data });
}

export async function createDocument(...[req, res]: MiddlewareArgs<{}, {}, z.infer<typeof documentSchema.createDocumentSchema['body']>>) {
 const data = await documentService.createDocument({ ...req.body, ctx: req.ctx });
 console.log(data)
 res.status(StatusCodes.CREATED).json(data)
}

export async function createDocumentInvitations(...[req, res]: MiddlewareArgs<{}, {}, z.infer<typeof documentSchema.documentInvitationSchema['body']>>) {
 const result = await createDocumentInvitations(req.body.invitees.map(x => ({ ...x, inviterId: req.ctx!.user.id })));
 
 res.status(StatusCodes.CREATED).json({
  message: "Invites sent successfully",
  data: result.map(r => r.id)
 })
}