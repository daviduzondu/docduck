import * as invitationSchema from './invitation.validation';
import * as invitationService from './invitation.service';
import { authedBase, base, router } from '@/lib/os';

export const invitationRouter = {
 acceptDocumentInvitation:
  router(authedBase)
   .get('/{id}/', {
    description: 'Accept the invitation for a document'
   })
   .input(invitationSchema.acceptDocumentInvitationSchema)
   .handler(({ context, input }) =>
    invitationService.acceptDocumentInvitation(input.id, context))
}