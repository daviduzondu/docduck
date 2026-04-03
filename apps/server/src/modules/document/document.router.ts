import * as documentSchema from './document.validation';
import * as documentService from '@/modules/document/document.service';
import * as invitationService from '@/modules/invitation/invitation.service';

import { base, r } from '@/orpc/os';
import { ensureAuth } from '@/modules/auth/auth.middleware';
import { ensureDocumentOwner } from '@/modules/document/document.middleware';
import z from 'zod';


// documentRouter
//  .post('/:id/invitations',
//   ensureAuth.ensureAuth,
//   helpers.validateRequest(documentSchema.documentInvitationSchema),
//   documentMiddleware.ensureDocumentOwner,
//   documentController.createDocumentInvitations
//  )


export const documentRouter = base.prefix("/documents").router({
 getDocument:
  r.get('/{documentId}', { description: "Get document by ID", inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({ documentId: z.string() })
   }))
   .handler(({ input }) =>
    documentService.getDocument(input.params)),

 createDocument:
  r.post('/new')
   .use(ensureAuth).
   input(documentSchema.createDocumentSchema)
   .handler(({ input, context }) => 
    documentService.createDocument(input, context)),

 createDocumentInvitations:
  r.post('/{id}/invitations', { inputStructure: 'detailed' })
   .input(documentSchema.documentInvitationSchema)
   .use(ensureAuth)
   .use(ensureDocumentOwner, input => input.params.id)
   .handler(({ input, context }) => invitationService.addDocInvitees(input.params.id, input.body.invitees.map(i => ({ ...i, inviterId: context.user.id }))))
});