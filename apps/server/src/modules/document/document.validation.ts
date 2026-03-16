import * as z from "zod";

export const getDocumentSchema = z.object({
 documentId: z.uuid()
});

export const createDocumentSchema = z.object({
 // state: z.uint64(),
 title: z.string().min(1).optional(),
})