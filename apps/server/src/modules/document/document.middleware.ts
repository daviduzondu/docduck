import { db } from "@/lib/kysely";
import { AppError } from "@/lib/helpers";
import { StatusCodes } from "http-status-codes";
import { AppContext } from "@/types/types";
import { base } from "@/orpc/os";
import * as documentService from '@/modules/document/document.service';

// export const verifyDocumentAccess = async (req: Request<{}, {}, z.infer<typeof getDocumentSchema['body']>>, res: Response, next:  => {
//  const isDocumentVisible = await db.selectFrom('document').select(['visibility', 'document.id']).where('id', '=', req.body.documentId).executeTakeFirstOrThrow();
//  if (isDocumentVisible.visibility === 'PUBLIC') return next();
//  if (!req.ctx?.user.id) throw new AppError("You must be signed in to perform this action.", StatusCodes.UNAUTHORIZED);

//  const permission = await db.selectFrom('permission').select(['role', 'userId', 'documentId']).where('documentId', '=', req.body.documentId).where('permission.userId', '=', req.ctx.user.id).executeTakeFirst();
//  if (permission) return next();

//  throw new AppError("Sorry, you do not have access to one or more documents in this list", StatusCodes.FORBIDDEN);
// }

// export const ensureDocumentOwner = (documentId: string, userId) => base.middleware(async({ context, next } => {
//  const { ownerId } = await db.selectFrom('document').where('document.id', '=', documentId).select(['ownerId']).executeTakeFirstOrThrow(() => new AppError("Document with id ${documentId} could not be found", StatusCodes.NOT_FOUND));

//  if (ownerId !== userId) throw new AppError("You are not allowed to perform this action", StatusCodes.UNAUTHORIZED);
// }))

export const ensureDocumentOwner = base
 .$context<Required<AppContext>>()
 .middleware(async ({ context, next, errors }, documentId: string) => {
  const doc = await db
   .selectFrom('document')
   .select(['ownerId'])
   .where('document.id', '=', documentId)
   .where('document.ownerId', '=', context.user.id)
   .executeTakeFirst();

  if (!doc) {
   throw errors.FORBIDDEN();
  }

  return next({
   context
  });
 });


export const ensureCanEditDocument = base
 .middleware(async ({ context, next, errors }, documentId: string) => {
  const { permissions } = await documentService.getDocumentWithPermissions(documentId, context.user?.id);
  if (!permissions.canEdit) throw errors.FORBIDDEN();
  return next({
   context: { ...context }
  })
 })



export const ensureCommentAuthor = base
 .$context<Required<AppContext>>()
 .middleware(async ({ context, next, errors }, { documentId, commentId }: { documentId: string, commentId: string }) => {
  const comment = await db.selectFrom('document_comment')
   .where('document_comment.documentId', '=', documentId)
   .where('document_comment.userId', '=', context.user.id)
   .where('document_comment.id', '=', commentId)
   .select(['userId'])
   .executeTakeFirst();
  if (comment?.userId !== context.user.id) throw errors.FORBIDDEN({
   message: "You're not the author of this comment"
  });
  return next({
   context
  });
 })