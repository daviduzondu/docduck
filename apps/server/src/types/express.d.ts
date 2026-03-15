import { auth } from "../modules/auth/better-auth";

export { };

declare global {
 namespace Express {
  interface Request {
   ctx?: Awaited<ReturnType<typeof auth.api.getSession>>;
  }
 }
}
