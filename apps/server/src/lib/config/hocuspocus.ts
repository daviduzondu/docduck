import { Hocuspocus } from '@hocuspocus/server'
import { WebSocketServer } from 'ws'
import { auth } from '@/modules/auth/better-auth'
import { AppError } from '@/lib/helpers'
import { StatusCodes } from 'http-status-codes'
import * as documentService from '@/modules/document/document.service'
import { Database } from '@hocuspocus/extension-database'
import { db } from '@/db/kysely'
import { Logger } from '@hocuspocus/extension-logger'
import { fromNodeHeaders } from 'better-auth/node'

export const hocuspocus = new Hocuspocus({
 async onAuthenticate(data) {
  data.connectionConfig.readOnly = true
  const authData = await auth.api.getSession({
   headers: fromNodeHeaders(data.requestHeaders),
  })
  const permissions = await documentService.getDocumentWithPermissions(
   data.documentName,
   authData?.user.id ?? null
  )
  if (!permissions.permissions.canView)
   throw new AppError(
    'You must be signed in to perform this action!',
    StatusCodes.UNAUTHORIZED
   )
  if (permissions.permissions.canEdit) data.connectionConfig.readOnly = false
  return authData
 },
 async onStateless({ document, payload }) {
  document.broadcastStateless(payload)
  return new Promise<void>((resolve) => {
   resolve()
  })
 },
 async beforeHandleMessage(data) {
  data.connection.readOnly = true
  const authData = await auth.api.getSession({
   headers: fromNodeHeaders(data.requestHeaders),
  })
  const permissions = await documentService.getDocumentWithPermissions(
   data.documentName,
   authData?.user.id ?? null
  )
  if (!permissions.permissions.canView)
   throw new AppError(
    'You must be signed in to perform this action!',
    StatusCodes.UNAUTHORIZED
   )
  if (permissions.permissions.canEdit) data.connection.readOnly = false
  return authData
 },
 extensions: [
  new Logger(),
  new Database({
   fetch: async (data) => {
    const result = await db
     .selectFrom('document')
     .where('document.id', '=', data.documentName)
     .select(['yjsState'])
     .executeTakeFirstOrThrow()

    return result.yjsState
   },
   store: async (data) => {
    try {
     await db
      .updateTable('document')
      .where('document.id', '=', data.documentName)
      .set({
       yjsState: data.state,
      })
      .returning(['id'])
      .executeTakeFirstOrThrow(() => {
       throw new AppError(
        `Failed to update document with id: ${data.documentName}`,
        StatusCodes.NOT_FOUND
       )
      })

     // Create snapshot
     await documentService.createSnapshot(data.documentName)
    } catch (error) {
     if (error instanceof AppError) {
      data.document.broadcastStateless(
       JSON.stringify({ data: 'Failed to update document', type: 'notify' })
      )
     }
    }
   },
  }),
 ],
 debounce: 35000,
})

export function initializeHocuspocus(wss: WebSocketServer) {
 wss.on('connection', (ws, req) => {
  hocuspocus.handleConnection(ws, req)
  ws.on('error', console.error)
 })
}
