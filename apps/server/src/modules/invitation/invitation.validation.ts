import z from 'zod';

export const acceptDocumentInvitationSchema = z.object({
    id: z.uuid({
      error: "Invitation ID must be a valid UUID."
    })
  })