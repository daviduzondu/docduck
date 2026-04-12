import { betterAuth } from "better-auth";
import { db } from "../../lib/kysely";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
 database: {
  db,
  type: 'postgres'
 },
 appName: "DocDuck",
 trustedOrigins: ['http://localhost:3000'],
 emailAndPassword: {
  enabled: true,
  autoSignIn: false,
 },
 baseURL: 'http://localhost:1711',
 plugins: [openAPI()],
 advanced: {
  disableOriginCheck: process.env.NODE_ENV === "PRODUCTION" ? false : true,
  // defaultCookieAttributes: {
  //  sameSite: "none",   // required for cross-port in Firefox
  //  secure: false,      // must be false for http:// localhost
  //  httpOnly: true,
  // }
 }
});

