import express, { Router } from 'express';
import * as documentController from '@/modules/document/document.controller';
import * as helpers from '../../lib/helpers';
import * as documentSchema from './document.validation';
import * as documentMiddleware from './document.middleware';
import * as authMiddleware from '@/modules/auth/auth.middleware'

const documentRouter: Router = express.Router();

documentRouter
 .get('/',
  helpers.validateRequest(documentSchema.getDocumentSchema),
  documentMiddleware.verifyDocumentAccess,
  documentController.getDocument)
 .post('/new',
  authMiddleware.ensureAuth,
  helpers.validateRequest(documentSchema.createDocumentSchema),
  documentController.createDocument
 ).post('/:id/invitations',
  authMiddleware.ensureAuth,
  helpers.validateRequest(documentSchema.documentInvitationSchema),
  documentMiddleware.ensureDocumentOwner,
  documentController.createDocumentInvitations
 )


export default documentRouter; 