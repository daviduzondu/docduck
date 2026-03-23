import * as invitationService from '@/modules/invitation/invitation.service';
import { MiddlewareArgs } from "@/types/types";
import { StatusCodes } from "http-status-codes";


export async function acceptDocumentInvitation(...[req, res, next]: MiddlewareArgs<{ id: string }>) {
 const role = await invitationService.acceptDocumentInvitation(req.params.id, req.ctx);
 res.status(StatusCodes.OK).json({
  message: 'Invitation accepted successfully',
  role
 })
}