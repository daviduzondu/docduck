import { AppContext, MiddlewareArgs } from "@/types/types";
import * as invitationsService from '@/modules/invitation/invitation.service';
import { base } from "@/orpc/os";

// export const ensureInviteeMatch = async (...[req, res, next]: MiddlewareArgs<{ id: string }, {}, {}>) => {
//  const invitation = await invitationsService.getInvitationDetails(req.params.id);
//  if (invitation.email !== req.ctx?.user.email) throw new AppError("You are using a different account than the intended recipient", StatusCodes.FORBIDDEN);
//  next();
// }

export const ensureInviteeMatch = base
 .$context<Required<AppContext>>()
 .middleware(async ({ context, next, errors }, invitationId: string) => {
    const invitation = await invitationsService.getInvitationDetails(invitationId);
   if (invitation.email !== context.user.email) throw errors.FORBIDDEN();
  return next({
   context: { ...context }
  })
 })
