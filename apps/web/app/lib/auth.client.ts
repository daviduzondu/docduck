import { createAuthClient } from "better-auth/react";
import { faker } from '@faker-js/faker';


export const authClient = createAuthClient({
 baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
 fetchOptions: {
  credentials: 'include'
 }
});


export async function loginWithEmailAndPassword(email: string, password: string, redirect?: string) {
 try {
  const result = await authClient.signIn.email({
   email, password,
   callbackURL: redirect
  });
  if (result.error) throw new Error(result.error.message)
 } catch (error) {
  throw error;
 }
}

export async function createAccountWithEmailAndPassword({ email, password, name }: { email: string, password: string, name: string }) {


 try {
  const result = await authClient.signUp.email({
   email,
   password,
   name,
  });
  console.log(result.data?.user)
  if (result.error) throw new Error(result.error.message)
 } catch (error) {
  throw error;
 }
}