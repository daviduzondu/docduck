import { createAuthClient } from "better-auth/react";
import { faker } from '@faker-js/faker';


const authClient = createAuthClient({
 baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL
});

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