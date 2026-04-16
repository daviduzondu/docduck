import { db } from "@/lib/kysely";
import { Request } from "express";
import { createDocumentSchema, getDocumentSchema } from "./document.validation";
import * as z from 'zod';
import { AppError } from "@/lib/helpers";
import { StatusCodes } from "http-status-codes";
import { Role, Visibility } from "@/db/prisma/generated/types";
import * as Y from 'yjs';
import { sql } from "kysely";
import { hocuspocus } from "@/lib/config/hocuspocus";
import { fromUint8Array } from 'js-base64'


type DocumentMeta = { documentId: string; title: string; visibility: Visibility };
type DocumentPermissions = { canEdit: boolean; canView: boolean; role?: Role };
type Comment = {
 id: string,
 resolved: boolean,
 parentId: string | null,
 text: string,
 commenterId: string
 createdAt: string
 updatedAt: string
}

export async function getDocumentWithPermissions(
 id: string,
 userId: string | null = null
): Promise<{ meta: DocumentMeta; permissions: DocumentPermissions }> {

 const result = await db.selectFrom('document')
  .leftJoin('permission', (join) => join.onRef('permission.documentId', '=', 'document.id').on(eb => eb('permission.userId', '=', userId).or('permission.userId', 'is', null)))
  .where('document.id', '=', id)
  .select(['document.id as documentId', 'visibility', 'permission.role', 'permission.userId', 'document.allowPublicEdits', 'document.title'])
  .executeTakeFirstOrThrow();
 return {
  meta: { documentId: result.documentId, title: result.title, visibility: result.visibility },
  permissions: {
   canEdit: !!(result?.documentId && result.role && (result.allowPublicEdits || (['OWNER', 'EDITOR'] as Role[]).includes(result.role))),
   canView: !!(result?.documentId && (result.visibility === 'PUBLIC' || result.role)),
   role: result?.role ?? undefined,
  }
 }
}

export async function getSnapshots(documentId: string, page: number = 1) {
 const offset = (page - 1) * 15;
 const results = await db.selectFrom('document_snapshot')
  .select(['creatorId', 'documentId', 'id', 'name', 'yjsState', 'createdAt'])
  .where('documentId', '=', documentId)
  .offset(offset)
  .orderBy('createdAt', 'desc')
  .limit(15)
  .execute();

 return results.map(result => {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, result.yjsState);
  const firstFewLines = doc.getXmlFragment('default').slice(0, 2);
  return ({ ...result, preview: firstFewLines.map(line => line.toJSON()).join(''), yjsState: undefined });
 })
}

export async function resolveComment({ documentId, commentId }: { documentId: string, commentId: string }) {
 // db
 const comment = await db.updateTable('document_comment').set({
  resolved: true
 }).where('document_comment.id', '=', commentId).returning(['document_comment.id']).executeTakeFirst();

 const hocuspocusDocument = hocuspocus.documents.get(documentId);
 if (hocuspocusDocument && comment?.id) {
  const commentsMap = hocuspocusDocument.getMap<Comment>('comments')
  commentsMap.set(commentId, {
   ...commentsMap.get(commentId)!,
   resolved: true
  })
 }

 return {
  message: "Comment resolved"
 }
}

export async function getSnapshotById({ documentId, snapshotId }: { documentId: string, snapshotId: string }) {
 const result = await db.selectFrom('document_snapshot')
  .select(['creatorId', 'documentId', 'id', 'name', 'yjsState'])
  .where('document_snapshot.id', '=', snapshotId)
  .where('document_snapshot.documentId', '=', documentId)
  .executeTakeFirstOrThrow(() => {
   throw new AppError('Snapshot not found', StatusCodes.NOT_FOUND)
  });

 const snapshotDoc = new Y.Doc();
 Y.applyUpdate(snapshotDoc, result.yjsState);

 return { ...result, yjsState: fromUint8Array(Y.encodeStateAsUpdate(snapshotDoc)) }
}

export async function createSnapshot(documentId: string, overrideInterval?: boolean) {
 return await db.transaction().execute(async (trx) => {
  const document = await trx.selectFrom('document')
   .select(eb => ['lastSnapshotAt', 'id', 'document.ownerId', 'yjsState',
    eb.or([
     eb('document.lastSnapshotAt', 'is', null),
     eb('document.lastSnapshotAt', '<', sql<Date>`now() - interval '00:15:00'`)
    ]).as("safeToCreateSnapshot")
   ])
   .where('document.id', '=', documentId)
   .forUpdate()
   .executeTakeFirstOrThrow();

  if (document.yjsState) {
   const doc = new Y.Doc();
   Y.applyUpdate(doc, document.yjsState);

   // const snapshot = Y.snapshot(doc);
   // const encodedSnapshot = Y.encodeSnapshot(snapshot);
   if (document.safeToCreateSnapshot || overrideInterval === true) {
    await trx.insertInto('document_snapshot').values({
     yjsState: Buffer.from(Y.encodeStateAsUpdate(doc)),
     documentId: document.id,
    }).execute();

    await trx.updateTable('document').set({
     lastSnapshotAt: sql`now()`
    })
     .where('id', '=', document.id)
     .execute();
   }
  }
 });
}

// Based on this comment: https://discuss.yjs.dev/t/is-there-a-way-to-revert-to-a-specific-version/379/5
function revertToSnapshot(
 liveDoc: Y.Doc,
 snapshotState: Uint8Array,
) {
 // 1. Reconstruct the document as it was at snapshot time
 const snapshotDoc = new Y.Doc()
 Y.applyUpdate(snapshotDoc, snapshotState)

 const currentStateVector = Y.encodeStateVector(liveDoc)
 const snapshotStateVector = Y.encodeStateVector(snapshotDoc)

 // 2. Compute everything that changed AFTER the snapshot
 const changesSinceSnapshot = Y.encodeStateAsUpdate(liveDoc, snapshotStateVector);

 // 3. Set up UndoManager on the snapshot doc to track those changes
 const snapshotOrigin = 'revert'
 const undoManager = new Y.UndoManager(snapshotDoc,
  { trackedOrigins: new Set([snapshotOrigin]) }
 )

 // 4. Apply the post-snapshot changes to the snapshot doc (with tracked origin)
 Y.applyUpdate(snapshotDoc, changesSinceSnapshot, snapshotOrigin)

 // 5. Undo them — this produces the inverse operations
 undoManager.undo()

 console.log(undoManager.doc)
 // 6. Extract just the new inverse update and apply to live doc
 const revertUpdate = Y.encodeStateAsUpdate(snapshotDoc, currentStateVector)
 Y.applyUpdate(liveDoc, revertUpdate)
}

export async function restoreSnapshotById(snapshotId: string, documentId: string,) {
 await createSnapshot(documentId, true);
 return await db.transaction().execute(async (trx) => {
  const snapshot = await trx.selectFrom('document_snapshot')
   .select(['document_snapshot.creatorId', 'document_snapshot.id', 'name', 'document_snapshot.yjsState'])
   .where('document_snapshot.documentId', '=', documentId)
   .where('id', '=', snapshotId)
   .executeTakeFirstOrThrow();

  const document = await trx.selectFrom('document')
   .select(['id', 'ownerId', 'yjsState'])
   .where('document.id', '=', documentId)
   .forUpdate()
   .executeTakeFirstOrThrow();

  const hocuspocusDocument = hocuspocus.documents.get(document.id)!;
  if (hocuspocusDocument) {
   revertToSnapshot(hocuspocusDocument, snapshot.yjsState)
  } else if (document.yjsState) {
   const tempDoc = new Y.Doc()
   Y.applyUpdate(tempDoc, document.yjsState)
   revertToSnapshot(tempDoc, snapshot.yjsState)

   await trx.updateTable('document')
    .set({ yjsState: Buffer.from(Y.encodeStateAsUpdate(tempDoc)) })
    .where('id', '=', documentId)
    .execute()
  }

  return {
   snapshotId: snapshot.id,
   connectionsCount: hocuspocus.getConnectionsCount()
  }
 })
}

// TODO: This endpoint might not be needed
export async function getSnapshotDiff({ snapshotId, documentId }: { snapshotId: string, documentId: string }) {
 const document = await db.selectFrom('document').where('document.id', '=', documentId).select(['id', 'yjsState']).executeTakeFirstOrThrow();
 const snapshot = await db.selectFrom('document_snapshot').where('document_snapshot.id', '=', snapshotId).select(['id', 'yjsState']).executeTakeFirstOrThrow();
 const currentDoc = new Y.Doc();
 Y.applyUpdate(currentDoc, document.yjsState!);

 const snapshotDoc = new Y.Doc();
 Y.applyUpdate(snapshotDoc, snapshot.yjsState!);

 const snapshotDocVector = Y.encodeStateVector(snapshotDoc!)

 // const changesSinceSnapshot = Y.encodeStateAsUpdate(currentDoc, snapshotDocVector); // snapshotDocVector here is for efficiency or something idk

 const diffDoc = new Y.Doc();
 const updates = Y.diffUpdate(document.yjsState!, snapshotDocVector);
 Y.applyUpdate(diffDoc, updates);
 console.log("HELLO!")

 return {
  diff: fromUint8Array(Y.encodeStateAsUpdate(currentDoc))
 }
}

export async function addNewComment({ text, userId, documentId }: { text: string, userId: string, documentId: string }) {
 const hocuspocusDocument = hocuspocus.documents.get(documentId);
 if (hocuspocusDocument) {
  const commentsMap = hocuspocusDocument.getMap<Comment>('comments');
  const { id: commentId, resolved, parentId, ...rest } = await db.insertInto('document_comment').values({
   documentId,
   text,
   userId,
  })
   .returning(['id', 'resolved', 'parentId', 'createdAt', 'updatedAt'])
   .executeTakeFirstOrThrow();

  commentsMap.set(commentId, {
   id: commentId,
   text,
   resolved,
   commenterId: userId,
   parentId,
   createdAt: rest.createdAt.toISOString(),
   updatedAt: rest.updatedAt.toISOString()
  });
  return {
   commentId,
   parentId
  }
 } else {
  throw new AppError("You're not connected to any document", StatusCodes.BAD_REQUEST)
 }
}


export async function updateDocumentTitle(id: string, title: string) {
 return await db.updateTable('document').set({
  title: title,
 }).where('document.id', '=', id).returning(['id', 'title']).execute();
}

export async function getDocumentCollaborators(id: string) {
 return await db.selectFrom('document')
  .innerJoin('permission', 'permission.documentId', 'document.id')
  .innerJoin('user', 'permission.userId', 'user.id')
  .where('document.id', '=', id)
  .select(['permission.userId as id', 'permission.role', 'user.email', 'user.image', 'user.isAnonymous', 'user.name']).execute()
}

export async function getDocument(data: z.infer<typeof getDocumentSchema>['params']) {
 return await db.selectFrom('document').where('document.id', '=', data.documentId).select(['id', 'title', 'visibility', 'ownerId']).executeTakeFirstOrThrow();
}

export async function createDocument(data: z.infer<typeof createDocumentSchema>, ctx: Request["ctx"]) {
 return await db.transaction().execute(async (trx) => {
  const { id: documentId } = await trx.insertInto('document').values({
   ownerId: ctx!.user.id,
   title: data.title
  }).returning(['id']).executeTakeFirstOrThrow(() => { throw new AppError("Failed to create document", StatusCodes.INTERNAL_SERVER_ERROR) });

  const { role } = await trx.insertInto('permission').values({
   documentId,
   role: "OWNER",
   userId: ctx!.user.id,
  }).returning(['role']).executeTakeFirstOrThrow(() => {
   throw new AppError("An error occured when generating permissions", StatusCodes.INTERNAL_SERVER_ERROR)
  });

  return { documentId, role }
 })
}