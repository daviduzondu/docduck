import pino from 'pino-http'
import cors from 'cors'
import { Server } from 'http'
import { WebSocketServer } from 'ws'
import Redis from 'ioredis'

export const logger = pino({
 ...(process.env.NODE_ENV === 'PRODUCTION'
  ? {}
  : {
     transport: {
      target: 'pino-pretty',
      options: { colorize: true },
     },
    }),
})

export const corsConfig: cors.CorsOptions = {
 credentials: true,
 exposedHeaders: ['Content-Disposition'],
 origin: [process.env.FRONTEND_URL!],
}

export const createWebsocketServer = (server: Server) =>
 new WebSocketServer({
  server,
  path: '/collab',
 })

export const redis = new Redis({
 maxRetriesPerRequest: null,
})
