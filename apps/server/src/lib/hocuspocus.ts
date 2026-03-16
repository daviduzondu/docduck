import { Hocuspocus } from "@hocuspocus/server";
import { WebSocketServer } from 'ws';
import { auth } from '@/modules/auth/better-auth';
import { AppError, verifyRole } from "./helpers";
import { StatusCodes } from "http-status-codes";
import { Role } from "@/db/prisma/generated/types";

type HocuspocusContext = Awaited<ReturnType<typeof auth.api.getSession>> & { role: Role };
export const hocuspocus = new Hocuspocus({
 async onAuthenticate(data) {
  const authData = await auth.api.getSession({
   headers: data.request.headers
  });
  if (!authData) throw new AppError("You must be signed in to perform this action!", StatusCodes.UNAUTHORIZED);
  const role = await verifyRole({ documentId: data.documentName, userId: authData.user.id });
  if (role === 'VIEWER') data.connectionConfig.readOnly = true;
  return Object.assign(authData, { role });
 },
 extensions: [
  // new Database({
  //  fetch: async (data) => {
  //   return new Promise(async (resolve) => {
  //    const result = await db.selectFrom('document').where("document.id", "=", data.documentName).select(['yjsState']).executeTakeFirstOrThrow();
  //    resolve(result?.yjsState ?? null);
  //   })
  //  },
  //  store: async (data) => {
  //   db.updateTable('document').where('document.id', '=', data.documentName).set({
  //    yjsState: data.state
  //   }).returning(['id']).executeTakeFirstOrThrow(() => { throw new AppError(`Failed to update document with id: ${data.documentName}`, StatusCodes.NOT_FOUND) })
  //  },
  // })
 ],
 onConnect(data) {
  return new Promise((res) => res(undefined));
 },
 debounce: 35000
});

export function initializeHocuspocus(wss: WebSocketServer) {
 wss.on('connection', (ws, req) => {
  hocuspocus.handleConnection(ws, req);
  ws.on('error', console.error);
 })
}