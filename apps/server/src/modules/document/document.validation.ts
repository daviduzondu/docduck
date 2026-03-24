import * as z from "zod";
import { RequestSchema } from "../../types/types";
import { createErrorMap } from "zod-validation-error";

z.config({
 customError: createErrorMap()
})

export const getDocumentSchema = {
 body: z.object({
  documentId: z.uuid()
 })
}

export const createDocumentSchema = {
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
   role: z.enum(["EDITOR", "VIEWER"])
  }))
 })
}