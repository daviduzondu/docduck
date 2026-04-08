import { Hocuspocus } from "@hocuspocus/server";
import { WebSocketServer } from 'ws';
import { auth } from '@/modules/auth/better-auth';
import { AppError } from "@/lib/helpers";
import { StatusCodes } from "http-status-codes";
import * as documentService from '@/modules/document/document.service';
import { Database } from "@hocuspocus/extension-database";
import { db } from "@/lib/kysely";
import { Logger } from "@hocuspocus/extension-logger";

// const statelessMessageSchema = {
//  "update:title": 
// },
export const hocuspocus = new Hocuspocus({
 async onAuthenticate(data) {
  data.connectionConfig.readOnly = true;
  const authData = await auth.api.getSession({ headers: data.requestHeaders });
  const permissions = await documentService.getDocumentWithPermissions(data.documentName, authData?.user.id ?? null);
  if (!permissions.permissions.canView) throw new AppError("You must be signed in to perform this action!", StatusCodes.UNAUTHORIZED);
  if (permissions.permissions.canEdit) data.connectionConfig.readOnly = false;

  return authData;
 },
 async onStateless({ document, payload }) {
  document.broadcastStateless(payload.toString());
 },
 extensions: [
  new Logger(),
  new Database({
   fetch: async (data) => {
    return new Promise(async (resolve) => {
     const result = await db.selectFrom('document').where("document.id", "=", data.documentName).select(['yjsState']).executeTakeFirstOrThrow();
     resolve(result?.yjsState ?? null);
    })
   },
   store: async (data) => {
    db.updateTable('document').where('document.id', '=', data.documentName).set({
     yjsState: data.state
    }).returning(['id']).executeTakeFirstOrThrow(() => { throw new AppError(`Failed to update document with id: ${data.documentName}`, StatusCodes.NOT_FOUND) })
   },
  })
 ],
 debounce: 35000
});

export function initializeHocuspocus(wss: WebSocketServer) {
 wss.on('connection', (ws, req) => {
  hocuspocus.handleConnection(ws, req);
  ws.on('error', console.error);
 })
}