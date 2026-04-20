import { betterAuth } from "better-auth";
import { db } from "../../lib/kysely";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
 database: {
  db,
  type: 'postgres'
 },
 appName: "DocDuck",
 trustedOrigins: [process.env.FRONTEND_URL!],
 emailAndPassword: {
  enabled: true,
  autoSignIn: true,
 },
 baseURL: process.env.BACKEND_URL!,
 plugins: [openAPI()],
 advanced: {
  disableOriginCheck: process.env.NODE_ENV === "PRODUCTION" ? false : true,
 }
});

