import * as z from "zod";
import { Role } from "@/db/prisma/generated/types";
import { RequestSchema } from "../../types/types";

export const getDocumentSchema = {
 body: z.object({
  documentId: z.uuid()
 })
}

export const createDocumentSchema: RequestSchema = {
 body: z.object({
  // state: z.uint64(),
  title: z.string().min(1).optional(),
 })
}

export const documentInvitationSchema = {
 params: z.object({ id: z.uuid() }),
 body: z.object({
  invitees: z.array(z.object({
   email: z.email(),
   role: z.enum(Role)
  }))
 })
}