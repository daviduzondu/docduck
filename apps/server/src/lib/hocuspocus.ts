import { Hocuspocus, } from "@hocuspocus/server";
import { WebSocketServer } from 'ws';

export function initializeHocuspocus(wss: WebSocketServer) {
 const hocuspocus = new Hocuspocus({
  onConnect(data) {
   return new Promise((res) => res(undefined));
  },
 });

 wss.on('connection', (ws, req) => {
  hocuspocus.handleConnection(ws, req);
  ws.on('error', console.error);
 })
}

