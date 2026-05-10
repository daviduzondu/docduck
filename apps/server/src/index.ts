import 'dotenv/config'
import { OpenAPIHandler } from '@orpc/openapi/node'
import { onError, ORPCError } from '@orpc/server'
import { CORSPlugin } from '@orpc/server/plugins'
import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import express, { type Express } from 'express'
import { createServer } from 'http'
import { Request, Response, NextFunction } from 'express'

import { initializeHocuspocus } from '@/lib/config/hocuspocus'
import { corsConfig, createWebsocketServer } from '@/lib/config/misc'
import { auth } from '@/modules/auth/better-auth'
import { appRouter } from '@/orpc/app.router'
import { generateContract } from '@/orpc/scripts/generate-contract'
import { AppError } from '@/lib/helpers'
import { NoResultError } from 'kysely'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'

if (!process.env.NODE_ENV)
 throw new Error('Failed to specify Node.js environment')
const PORT = process.env.PORT ?? '1711'
const app: Express = express()
const server = createServer(app)
generateContract()
initializeHocuspocus(createWebsocketServer(server))
const handler = new OpenAPIHandler(appRouter, {
 plugins: [new CORSPlugin()],
  interceptors: [
// I know this is bad lol. But for now, it'll do for now haha
   onError((err, opts) => {
    if (err instanceof ORPCError) {
     opts.context.res.status(err.status).json(err.toJSON())
    } else {
     opts.context.next(err)
    }
   }),
  ],
})
// app.use(logger);
app.use(cors(corsConfig))
app.all('/api/auth/{*any}', toNodeHandler(auth))
app.use(express.json())
app.use('/api{/*path}', async (req, res, next) => {
 const { matched } = await handler.handle(req, res, {
  prefix: '/api',
  context: { req, res, next },
 })
 if (matched) return
 next()
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
 if (err instanceof AppError) {
  sendErrorResponse(
   new ORPCError(getReasonPhrase(StatusCodes[err.statusCode]), {
    status: err.statusCode,
    message: err.message,
   })
  )
 } else if (err instanceof SyntaxError && 'body' in err) {
  sendErrorResponse(
   new ORPCError(getReasonPhrase(StatusCodes.BAD_REQUEST), {
    status: StatusCodes.BAD_REQUEST,
    message: err.message,
   })
  )
 } else if (err instanceof NoResultError) {
  sendErrorResponse(
   new ORPCError(getReasonPhrase(StatusCodes.NOT_FOUND), {
    status: StatusCodes.NOT_FOUND,
    message: 'The resource you tried to access could not be found',
   })
  )
 } else {
  sendErrorResponse(
   new ORPCError(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
   })
  )
 }

 function sendErrorResponse(error: ORPCError<string, unknown>) {
  res.status(error.status).json(error.toJSON())
 }
})

server.listen(PORT, () => {
 console.log(`Server now listening on ${PORT}`)
})
