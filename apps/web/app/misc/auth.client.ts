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
  alert("Failed to sign in!");
  throw error;
 }
 alert("Sign in successful!");
}



export async function createAccountWithEmailAndPassword() {
 await authClient.signUp.email({
  email: faker.internet.email({
   provider: 'gmail.com'
  }),
  password: 'password',
  name: faker.person.fullName()
 }).catch(() => {
  alert("Failed to sign up!")
 });

 alert("Sign up sucessful!")
}