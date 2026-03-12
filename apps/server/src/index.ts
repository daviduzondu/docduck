import 'dotenv/config';
import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import { auth } from "@/modules/auth/auth";
import { toNodeHandler } from "better-auth/node";
import { createServer } from 'http';
import { initializeHocuspocus } from '@/lib/hocuspocus';
import { WebSocketServer } from 'ws';
import documentRouter from './modules/document/document.route';
import { AppError } from './lib/helpers';
import pino from 'pino-http';

const app = express();
const server = createServer(app);
const corsConfig: cors.CorsOptions = {
 credentials: true,
 origin: ['http://localhost:3000']
}
const PORT = process.env.PORT ?? "1711";

app.use(pino());
app.use(cors(corsConfig));
app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use('/api/document', documentRouter);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
 if (err instanceof AppError) {
  res.status(err.statusCode).json({
   message: err.message
  })
 }
 res.status(500).json({
  message: 'An internal error occured'
 });
});


const wss = new WebSocketServer({ server, path: '/collab ' });
initializeHocuspocus(wss);
server.listen(PORT, () => console.log(`Server now listening on ${PORT}`));