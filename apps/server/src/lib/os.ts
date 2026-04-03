import { ensureAuth } from '@/modules/auth/auth.middleware';
import { AppContext } from '@/types/types';
import { os, Route } from '@orpc/server'

type RouterOpts = Omit<Route, 'method' | 'path'>;
export const base = os.$context<AppContext>();
// export const authedBase = base.use((await import('@/modules/auth/auth.middleware')).ensureAuth);

export const r = {
 get: (path?: `/${string}`, opts?: RouterOpts) =>
  base.route({ method: 'GET', ...(path ? { path } : {}), ...opts }),
 post: (path?: `/${string}`, opts?: RouterOpts) =>
  base.route({ method: 'POST', ...(path ? { path } : {}), ...opts }),
 put: (path?: `/${string}`, opts?: RouterOpts) =>
  base.route({ method: 'PUT', ...(path ? { path } : {}), ...opts }),
 patch: (path?: `/${string}`, opts?: RouterOpts) =>
  base.route({ method: 'PATCH', ...(path ? { path } : {}), ...opts }),
 delete: (path?: `/${string}`, opts?: RouterOpts) =>
  base.route({ method: 'DELETE', ...(path ? { path } : {}), ...opts }),
 head: (path?: `/${string}`, opts?: RouterOpts) =>
  base.route({ method: 'HEAD', ...(path ? { path } : {}), ...opts }),
}

