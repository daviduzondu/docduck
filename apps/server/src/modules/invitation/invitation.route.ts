import express, { Router } from 'express';
import { ensureAuth } from '@/modules/auth/auth.middleware';
import { ensureInviteeMatch } from './invitation.middleware';

const invitationRouter: Router = express.Router();

invitationRouter.patch("/:id/",
 ensureAuth, ensureInviteeMatch, 
)

export default invitationRouter;