import { createErrorMap } from "zod-validation-error";
import { RequestSchema } from "../../types/types";
import z from 'zod';

export const acceptDocumentInvitationSchema: RequestSchema = {
 params: z.object({ id: z.uuid({ error: "Invitation ID must be a valid UUID." }) })
}