import * as z from "zod";

export const getDocumentSchema = z.object({
 documentIds: z.array((z.uuid()))
});

