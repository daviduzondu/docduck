import axios from 'axios';
import { cookies } from 'next/headers';

export const api = axios.create({
 baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL + '/api',
 withCredentials: true,
 headers: {
  "Content-Type": "application/json",
 }
});

api.interceptors.request.use(async (config) => {
 const token = (await cookies()).get("better-auth.session_token");
 if (token) config.headers['Cookie'] = token;
 return config;
})