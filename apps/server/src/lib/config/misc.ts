import pino from "pino-http";
import cors from 'cors';
import { Server } from "http";
import { WebSocketServer } from "ws";

export const logger = pino({
 ...(process.env.NODE_ENV === "PRODUCTION"
  ? {}
  : {
   transport: {
    target: "pino-pretty",
    options: { colorize: true }
   }
  }),
});

export const corsConfig: cors.CorsOptions = {
 credentials: true,
 exposedHeaders: ['Content-Disposition'],
 origin: ['http://localhost:3000'], // TODO: replace with env variable
}

export const createWebsocketServer = (server: Server) => new WebSocketServer({
 server, path: '/collab',
});