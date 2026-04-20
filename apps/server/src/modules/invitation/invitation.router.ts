import * as invitationSchema from './invitation.validation';
import * as invitationService from './invitation.service';
import { base, r } from '@/orpc/os';
import { ensureAuth } from '@/modules/auth/auth.middleware';
import { ORPCError } from '@orpc/server';
import { ensureInviteeMatch } from '@/modules/invitation/invitation.middleware';

export const invitationRouter = base.prefix('/invitations').router({
 acceptDocumentInvitation:
  r
   .patch('/{id}', {
    description: 'Accept the invitation for a document',
    inputStructure: 'detailed'
   })
   .use(ensureAuth)
   .input(invitationSchema.acceptDocumentInvitationSchema)
   .use(ensureInviteeMatch, input => input.params.id)
   .handler(async ({ context, input, errors }) => {
    return invitationService.acceptDocumentInvitation(input.params.id, context, errors)
   })
});