import express, { Router } from 'express';
import * as documentController from '@/modules/document/document.controller';
import * as helpers from '../../lib/helpers';
import * as documentSchemas from './document.validation';
import * as documentMiddleware from './document.middleware';

const documentRouter: Router = express.Router();

documentRouter
 .get('/',
  helpers.validateBody(documentSchemas.getDocumentSchema),
  documentMiddleware.verifyDocumentAccess,
  documentController.getDocument)
 .post('/new',
  helpers.validateBody(documentSchemas.createDocumentSchema),
  documentMiddleware.isAuthenticated,
  documentController.createDocument
 )


export default documentRouter;