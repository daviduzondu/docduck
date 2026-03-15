import * as z from "zod";

export const getOrUpdateDocumentSchema = z.object({
 documentId: z.uuid()
});
