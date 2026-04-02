import { ensureAuth } from '@/modules/auth/auth.middleware';
import { AppContext } from '@/types/types';
import { Builder, BuilderWithMiddlewares, Context, ErrorMap, Meta, os, Route } from '@orpc/server'
import type { StandardSchemaV1 } from '@standard-schema/spec';

type RouterOpts = Omit<Route, 'method' | 'path'>;
export const base = os.$context<AppContext>();
export const authedBase = base.use(ensureAuth);
export function router<A extends Context, B extends Context, C extends StandardSchemaV1, D extends StandardSchemaV1, E extends ErrorMap, F extends Meta>(builder: Builder<A, B, C, D, E, F> | BuilderWithMiddlewares<A, B, C, D, E, F>) {
 return {
  get: (path?: `/${string}`, opts?: RouterOpts) =>
   builder.route({ method: 'GET', ...(path ? { path } : {}), ...opts }),
  post: (path?: `/${string}`, opts?: RouterOpts) =>
   builder.route({ method: 'POST', ...(path ? { path } : {}), ...opts }),
  put: (path?: `/${string}`, opts?: RouterOpts) =>
   builder.route({ method: 'PUT', ...(path ? { path } : {}), ...opts }),
  patch: (path?: `/${string}`, opts?: RouterOpts) =>
   builder.route({ method: 'PATCH', ...(path ? { path } : {}), ...opts }),
  delete: (path?: `/${string}`, opts?: RouterOpts) =>
   builder.route({ method: 'DELETE', ...(path ? { path } : {}), ...opts }),
  head: (path?: `/${string}`, opts?: RouterOpts) =>
   builder.route({ method: 'HEAD', ...(path ? { path } : {}), ...opts }),
 }
}

