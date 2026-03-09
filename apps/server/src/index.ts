import 'dotenv/config';
import express from "express";
import cors from 'cors';
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { createServer, IncomingMessage } from 'http';
import crossws from "crossws/adapters/node";
import { Hocuspocus, } from "@hocuspocus/server";

const app = express();
const server = createServer(app);
const corsConfig: cors.CorsOptions = {
 credentials: true,
 origin: ['http://localhost:3000']
}
const PORT = process.env.PORT ?? "1711";

const hocuspocus = new Hocuspocus();

const ws = crossws({
 serverOptions: {
  path: '/collab',
  
 },
 hooks: {
  open(peer) {
   console.log("New client connected!")
   const clientConnection = hocuspocus.handleConnection(
    peer.websocket,
    peer.request as unknown as IncomingMessage,
    { user_id: 1234 },
   );
   (peer as any)._hocuspocus = clientConnection;
  },
  message(peer, message) {
   console.log("hello", message.peer);
   (peer as any)._hocuspocus?.handleMessage(message.uint8Array());
  },
  close(peer, event) {
   (peer as any)._hocuspocus?.handleClose({
    code: event.code,
    reason: event.reason,
   });
  },
  error(peer, error) {
   console.error("WebSocket error for peer:", peer.id);
   console.error(error);
  },
 },
});

app.use(cors(corsConfig));

app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));

server.on('upgrade', (req, socket, head) => {
 ws.handleUpgrade(req, socket, head);
})
server.listen(PORT, () => console.log(`Server now listening on ${PORT}`));