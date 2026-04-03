import express, { Router } from 'express';
import * as documentSchema from './document.validation';
import * as documentService from '@/modules/document/document.service';
import * as invitationService from '@/modules/invitation/invitation.service';

import { base, r } from '@/lib/os';
import { Route } from '@orpc/server';
import { ensureAuth } from '@/modules/auth/auth.middleware';
import { ensureDocumentOwner } from '@/modules/document/document.middleware';


// documentRouter
//  .post('/:id/invitations',
//   ensureAuth.ensureAuth,
//   helpers.validateRequest(documentSchema.documentInvitationSchema),
//   documentMiddleware.ensureDocumentOwner,
//   documentController.createDocumentInvitations
//  )


export const documentRouter = {
 getDocument:
  r.get('/{id}', { description: "Get document by ID" })
   .input(documentSchema.getDocumentSchema)
   .handler(({ input, context }) =>
    documentService.getDocument(input)),

 createDocument:
  r.post('/new')
   .use(ensureAuth).
   input(documentSchema.createDocumentSchema)
   .handler(({ input, context }) =>
    documentService.createDocument(input, context)),

 createDocumentInvitations:
  r.post('/{id}/invitations')
   .input(documentSchema.documentInvitationSchema)
   .use(ensureAuth)
   .use(ensureDocumentOwner, input => input.params.id)
   .handler(({ input, context }) => invitationService.addDocInvitees(input.params.id, input.body.invitees.map(i => ({ ...i, inviterId: context.user.id }))))

}