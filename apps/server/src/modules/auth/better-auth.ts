import { betterAuth } from "better-auth";
import { db } from "@/lib/kysely";

export const auth = betterAuth({
 database: {
  db,
  type: 'postgres'
 },
 appName: "DocDuck",
 emailAndPassword: {
  enabled: true,
  autoSignIn: false
 }
});