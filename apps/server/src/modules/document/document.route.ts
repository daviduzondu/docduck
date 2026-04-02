import express, { Router } from 'express';
// import * as documentController from '@/modules/document/document.controller';
// import * as helpers from '../../lib/helpers';
// import * as documentMiddleware from './document.middleware';
// import * as authMiddleware from '@/modules/auth/auth.middleware'
import * as documentSchema from './document.validation';
import * as documentService from '@/modules/document/document.service';

import { authedBase, base, router } from '@/lib/os';
import { Route } from '@orpc/server';
import { ensureAuth } from '@/modules/auth/auth.middleware';


documentRouter
 .post('/:id/invitations',
  ensureAuth.ensureAuth,
  helpers.validateRequest(documentSchema.documentInvitationSchema),
  documentMiddleware.ensureDocumentOwner,
  documentController.createDocumentInvitations
 )


export const documentRouter = {
 getDocument: router.get(base, '/{id}', { description: "Get document by ID" }).input(documentSchema.getDocumentSchema).handler(({ input, context }) => documentService.getDocument(input)),

 createDocument: router.post('/new').use(ensureAuth).input(documentSchema.createDocumentSchema).handler(({ input, context }) => documentService.createDocument(input, context))

 createDocumentInvitations: router.post("/{id}/invitations").use(ensureAuth).hand
}