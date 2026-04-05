import type { JsonifiedClient } from '@orpc/openapi-client'
import type { ContractRouterClient } from '@orpc/contract'
import { createORPCClient, onError } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { AppRouter } from "@server/orpc/app.router";
import contract from '@server/orpc/contract.json';

const link = new OpenAPILink(contract as AppRouter, {
 url: process.env.NEXT_PUBLIC_SERVER_BASE_URL! + '/api',
 ...(typeof window === 'undefined' ? {
  headers: async () => (await import('next/headers')).headers()
 } : {}),
 fetch: (request, init) => {
  return globalThis.fetch(request, {
   ...init,
   headers: request.headers, 
   credentials: 'include', // Include cookies for cross-origin requests
  })
 },
 interceptors: [
  onError((error) => {
   console.error(error)
  })
 ],
})

export const orpc: JsonifiedClient<ContractRouterClient<AppRouter>> = createORPCClient(link);