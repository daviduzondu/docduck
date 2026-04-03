import * as invitationSchema from './invitation.validation';
import * as invitationService from './invitation.service';
import { base, r } from '@/lib/os';
import { ensureAuth } from '@/modules/auth/auth.middleware';

export const invitationRouter = base.prefix('/invitations').router({
 acceptDocumentInvitation:
  r
   .patch('/{id}', {
    description: 'Accept the invitation for a document',
   })
   .use(ensureAuth)
   .input(invitationSchema.acceptDocumentInvitationSchema)
   .handler(async ({ context, input }) => {
    return await invitationService.acceptDocumentInvitation(input.id, context)
   })
});