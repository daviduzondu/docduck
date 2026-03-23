import { Request, Response, NextFunction } from "express";
import z from 'zod';
import * as invitationService from '@/modules/invitation/invitation.service';
import { MiddlewareArgs } from "@/types/types";


export async function acceptDocumentInvitation(...[req, res, next]: MiddlewareArgs<{ id: string }>) {
 const data = await invitationService.acceptDocumentInvitation(req.params.id, req.ctx)
}