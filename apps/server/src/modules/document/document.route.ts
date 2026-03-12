import express, { Router } from 'express';
import { getDocumentsController } from '@/modules/document/document.controller';
import { verifyDocumentAccess } from './document.middleware';
import { validate, validateMiddleware } from '../../lib/helpers';
import { getDocumentSchema } from './document.validation';

const documentRouter: Router = express.Router();

documentRouter
 .get('/',
  validateMiddleware(getDocumentSchema, 'body'),
  verifyDocumentAccess,
  getDocumentsController);

export default documentRouter;