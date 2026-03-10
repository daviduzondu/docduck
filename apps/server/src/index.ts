import 'dotenv/config';
import express from "express";
import cors from 'cors';
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { createServer, IncomingMessage } from 'http';
import { initializeHocuspocus } from '@/lib/wss';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const corsConfig: cors.CorsOptions = {
 credentials: true,
 origin: ['http://localhost:3000']
}
const PORT = process.env.PORT ?? "1711";

app.use(cors(corsConfig));
app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));


const wss = new WebSocketServer({ server, path: '/collab' });
initializeHocuspocus(wss);
server.listen(PORT, () => console.log(`Server now listening on ${PORT}`));
