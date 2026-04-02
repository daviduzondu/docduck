import 'dotenv/config';
import express, { type Express, Request } from "express";
import cors from 'cors';
import { auth } from "@/modules/auth/better-auth";
import { toNodeHandler } from "better-auth/node";
import { createServer } from 'http';
import { initializeHocuspocus } from '@/lib/hocuspocus';
import { WebSocketServer } from 'ws';
import pino from 'pino-http';
import { ctx } from './modules/auth/auth.middleware';
import { CORSPlugin } from '@orpc/server/plugins'
import { onError, os } from '@orpc/server';
import { OpenAPIHandler } from '@orpc/openapi/node';


if (!process.env.NODE_ENV)
 throw new Error("Failed to specify Node.js environment");
const PORT = process.env.PORT ?? "1711";
const app: Express = express();
const server = createServer(app);
const corsConfig: cors.CorsOptions = {
 credentials: true,
 origin: ['http://localhost:3000'], // TODO: replace with env variable
}
const wss = new WebSocketServer({
 server, path: '/collab',
});
const logger = pino({
 ...(process.env.NODE_ENV === "PRODUCTION"
  ? {}
  : {
   transport: {
    target: "pino-pretty",
    options: { colorize: true }
   }
  }),
})
initializeHocuspocus(wss);
app.use(ctx);
app.use(logger);
app.use(cors(corsConfig));
app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));
// app.use('/api/documents', documentRouter);
// app.use('/api/invitations', invitationRouter);


const router = {
 ping: os.handler(async () => 'pong')
}

const handler = new OpenAPIHandler(router, {
 plugins: [new CORSPlugin()],
 interceptors: [
  onError((error) => {
   console.error(error)
  }),
 ],
})


app.use('/api/{/*path}', async (req, res, next) => {
 const { matched } = await handler.handle(req, res, {
  prefix: '/api'
 })

 if (matched) {
  return
 }

 next()
})

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
//    message: 'Internal server error'
//   });
//  }
// });

server.listen(PORT, () => console.log(`Server now listening on ${PORT}`));