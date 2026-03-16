import 'dotenv/config';
import express, { NextFunction, Request, Response, type Express } from "express";
import cors from 'cors';
import { auth } from "@/modules/auth/better-auth";
import { toNodeHandler } from "better-auth/node";
import { createServer } from 'http';
import { initializeHocuspocus } from '@/lib/hocuspocus';
import { WebSocketServer } from 'ws';
import documentRouter from './modules/document/document.route';
import { AppError } from './lib/helpers';
import pino from 'pino-http';
import { NoResultError } from 'kysely';
import { StatusCodes } from 'http-status-codes';
import { ctx } from './modules/auth/auth.middleware';

const PORT = process.env.PORT ?? "1711";
const app: Express = express();
const server = createServer(app);
const corsConfig: cors.CorsOptions = {
 credentials: true,
 origin: ['http://localhost:3000'],
}
const wss = new WebSocketServer({ server, path: '/collab' });
app.use(ctx);
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
 } else if (err instanceof NoResultError) {
  res.status(StatusCodes.NOT_FOUND).json({
   message: "The resource you tried to access could not be found"
  })
 } else {
  res.status(500).json({
   message: 'Internal server error'
  });
 }
});

initializeHocuspocus(wss);
server.listen(PORT, () => console.log(`Server now listening on ${PORT}`));