import { MiddlewareArgs } from "@/types/types";
import * as invitationsService from '@/modules/invitation/invitation.service';
import { AppError } from "../../lib/helpers";
import { StatusCodes } from "http-status-codes";

export const ensureInviteeMatch = async (...[req, res, next]: MiddlewareArgs<{ id: string }, {}, {}>) => {
 const invitation = await invitationsService.getInvitationDetails(req.params.id);
 if (invitation.email !== req.ctx?.user.email) throw new AppError("You are using a different account than the intended recipient", StatusCodes.FORBIDDEN);
 next();
}