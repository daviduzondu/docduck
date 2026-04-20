import 'dotenv/config';
import express, { type Express } from "express";
import cors from 'cors';
import { auth } from "@/modules/auth/better-auth";
import { toNodeHandler } from "better-auth/node";
import { createServer } from 'http';
import { hocuspocus, initializeHocuspocus } from '@/lib/config/hocuspocus';
import { CORSPlugin } from '@orpc/server/plugins'
import { onError } from '@orpc/server';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { corsConfig, createWebsocketServer } from '@/lib/config/misc';
import { appRouter } from '@/orpc/app.router';
import { onErrorCallback } from '@/orpc/callbacks.middleware';
import { generateContract } from '@/orpc/scripts/generate-contract';

if (!process.env.NODE_ENV) throw new Error("Failed to specify Node.js environment");
const PORT = process.env.PORT ?? "1711";
const app: Express = express();
const server = createServer(app);
generateContract();
initializeHocuspocus(createWebsocketServer(server));
const handler = new OpenAPIHandler(appRouter, {
 plugins: [new CORSPlugin()],
 interceptors: [onError(onErrorCallback)],
})
// app.use(logger);
app.use(cors(corsConfig));
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json());
app.use('/api{/*path}', async (req, res, next) => {
 const { matched } = await handler.handle(req, res, {
  prefix: '/api',
  context: { req },
 })
 if (matched) return
 next()
})
server.listen(PORT, () => console.log(`Server now listening on ${PORT}`));


// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//  req.log.error(err);
//  if (err instanceof AppError) {
//   res.status(err.statusCode).json({
//    message: err.message
//   })
//  }
//  else if (err instanceof SyntaxError && 'body' in err) {
//   return res.status(400).send({ message: err.message });
//  } else if (err instanceof NoResultError) {
//   res.status(StatusCodes.NOT_FOUND).json({
//    message: "The resource you tried to access could not be found"
//   })
//  } else {
//   res.status(500).json({
//    message: err.message || 'Internal server error'
//   });
//  }
// });
