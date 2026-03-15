import { Hocuspocus } from "@hocuspocus/server";
import { WebSocketServer } from 'ws';

export const hocuspocus = new Hocuspocus({
 onConnect(data) {
  return new Promise((res) => res(undefined));
 },
});

export function initializeHocuspocus(wss: WebSocketServer) {
 wss.on('connection', (ws, req) => {
  hocuspocus.handleConnection(ws, req);
  ws.on('error', console.error);
 })
}