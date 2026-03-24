import express, { Router } from 'express';
import { ensureAuth } from '@/modules/auth/auth.middleware';
import { ensureInviteeMatch } from './invitation.middleware';
import * as invitationController from './invitation.controller';
import { validateRequest } from '../../lib/helpers';
import * as invitationSchema from './invitation.validation'

const invitationRouter: Router = express.Router();

invitationRouter.patch("/:id/",
 ensureAuth,
 validateRequest(invitationSchema.acceptDocumentInvitationSchema),
 ensureInviteeMatch,
 invitationController.acceptDocumentInvitation
)

export default invitationRouter;