import * as z from "zod";
import { createErrorMap } from "zod-validation-error";

z.config({
 customError: createErrorMap()
})

export const getDocumentSchema = z.object({
 params: z.object({ documentId: z.uuid() })
});

export const createDocumentSchema = z.object({
 // state: z.uint64(),
 title: z.string().min(1).optional(),
});

export const documentInvitationSchema = z.object({
 params: z.object({ id: z.uuid() }),
 body: z.object({
  invitees: z.array(z.object({
   email: z.email(),
   role: z.enum(["EDITOR", "VIEWER"])
  }))
 })
});

export const getCollaboratorsSchema = z.object({
 params: z.object({ id: z.uuid() }),
})

export const updateDocumentSchema = z.object({
 params: z.object({ id: z.uuid() }),
 body: z.object({
  title: z.string().trim().nonempty({ error: "Title cannot be empty" })
 })
})