import { betterAuth } from "better-auth";
import { db } from "@/lib/kysely";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
 database: {
  db,
  type: 'postgres'
 },
 appName: "DocDuck",
 emailAndPassword: {
  enabled: true,
  autoSignIn: false
 },
 plugins: [openAPI()]
});