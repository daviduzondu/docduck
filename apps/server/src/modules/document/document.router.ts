import * as documentSchema from './document.validation';
import * as documentService from '@/modules/document/document.service';
import * as invitationService from '@/modules/invitation/invitation.service';

import { base, r } from '@/orpc/os';
import { ctx, ensureAuth } from '@/modules/auth/auth.middleware';
import { ensureCanEditDocument, ensureCommentAuthor, ensureDocumentOwner } from '@/modules/document/document.middleware';
import z from 'zod';

export const documentRouter = base.prefix("/documents").use(ctx).router({
 getDocument:
  r.get('/{documentId}', { description: "Get document by ID", inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({ documentId: z.string() })
   }))
   .handler(({ input }) =>
    documentService.getDocument(input.params)),

 getDocumentWithPermissions:
  r.get('/{documentId}/permissions', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({ documentId: z.string() })
   }))
   .handler(({ input, context }) =>
    documentService.getDocumentWithPermissions(input.params.documentId, context.user?.id)),

 getSnapshots:
  r.get('/{documentId}/snapshots', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({ documentId: z.string() }),
    query: z.object({ page: z.coerce.number().optional() }).optional()
   }))
   .use(ensureCanEditDocument, input => input.params.documentId)
   .handler(({ input }) => documentService.getSnapshots(input.params.documentId, input.query?.page)),

 getSnapshotDiff:
  r.get('/{documentId}/snapshots/{snapshotId}/diff', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({ documentId: z.string(), snapshotId: z.string() })
   }))
   .handler(({ input }) => documentService.getSnapshotDiff({ documentId: input.params.documentId, snapshotId: input.params.snapshotId })),

 getSnapshotById:
  r.get('/{documentId}/snapshots/{snapshotId}', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({ documentId: z.string(), snapshotId: z.string() })
   }))
   .use(ensureCanEditDocument, input => input.params.documentId)
   .handler(({ input }) => documentService.getSnapshotById({ snapshotId: input.params.snapshotId, documentId: input.params.documentId })),

 restoreSnapshotbyId:
  r.post('/{documentId}/snapshots/{snapshotId}/restore', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({ documentId: z.string(), snapshotId: z.string() })
   }))
   .use(ensureCanEditDocument, input => input.params.documentId)
   .handler(({ input }) => documentService.restoreSnapshotById(input.params.snapshotId, input.params.documentId)),

 addNewComment:
  r.post('/{documentId}/comments', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({
     documentId: z.string()
    }),
    body: z.object({
     text: z.string().min(1),
    })
   }))
   .use(ensureCanEditDocument, input => input.params.documentId)
   .use(ensureAuth)
   .handler(({ input, context }) =>
    documentService
     .addNewComment({
      text: input.body.text,
      userId: context.user.id,
      documentId: input.params.documentId
     })),

 editComment:
  r.patch('/{documentId}/comments/{commentId}', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({
     documentId: z.string(),
     commentId: z.string(),
    }),
    body: z.object({
     text: z.string().min(1),
    })
   }))
   .use(ensureCanEditDocument, input => input.params.documentId)
   .use(ensureAuth)
   .use(ensureCommentAuthor, input => ({ documentId: input.params.documentId, commentId: input.params.commentId }))
   .handler(({ input, }) => documentService.editComment({
    text: input.body.text,
    documentId: input.params.documentId,
    commentId: input.params.commentId
   })),

 resolveComment:
  r.patch('/{documentId}/comments/{commentId}/resolve', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({
     documentId: z.string(),
     commentId: z.string(),
    })
   }))
   .use(ensureCanEditDocument, input => input.params.documentId)
   .handler(({ input: { params: { documentId, commentId } } }) => { documentService.resolveComment({ documentId, commentId }) }),

 createDocument:
  r.post('/new')
   .use(ensureAuth)
   .input(documentSchema.createDocumentSchema)
   .handler(({ input, context }) =>
    documentService.createDocument(input, context)),

 updateDocumentTitle:
  r.patch('/{id}/title', { inputStructure: 'detailed' })
   .input(documentSchema.updateDocumentSchema)
   .use(ensureCanEditDocument, (input) => input.params.id)
   .handler(({ input }) =>
    documentService.updateDocumentTitle(input.params.id, input.body.title)),

 getCollaborators:
  r.get('/{id}/collaborators', { inputStructure: 'detailed' })
   .input(documentSchema.getCollaboratorsSchema)
   .use(ensureAuth)
   .use(ensureDocumentOwner, input => input.params.id)
   .handler(({ input }) =>
    documentService.getDocumentCollaborators(input.params.id)),

 createDocumentInvitations:
  r.post('/{id}/invitations', { inputStructure: 'detailed' })
   .input(documentSchema.documentInvitationSchema)
   .use(ensureAuth)
   .use(ensureDocumentOwner, input => input.params.id)
   .handler(({ input, context }) =>
    invitationService.addDocInvitees(input.params.id, input.body.invitees.map(i => ({ ...i, inviterId: context.user.id })), context.user))
});