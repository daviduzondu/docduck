import * as invitationSchema from './invitation.validation';
import * as invitationService from './invitation.service';
import { r } from '@/lib/os';
import { ensureAuth } from '@/modules/auth/auth.middleware';

export const invitationRouter = {
 acceptDocumentInvitation:
  r
   .get('/{id}/', {
    description: 'Accept the invitation for a document'
   })
   .use(ensureAuth)
   .input(invitationSchema.acceptDocumentInvitationSchema)
   .handler(({ context, input }) =>
    invitationService.acceptDocumentInvitation(input.id, context))
}