'use client';

import { useRef } from "react";
import { loginWithEmailAndPassword } from "../../lib/auth-client";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
 const emailRef = useRef<HTMLInputElement | null>(null);
 const passwordRef = useRef<HTMLInputElement | null>(null);
 const searchParams = useSearchParams();
 return (
  <div>
   <h1>Login</h1>

   <form onSubmit={(e) => e.preventDefault()}>
    <div>
     <label>Email</label>
     <input type="email" name="email" ref={emailRef} />
    </div>

    <div>
     <label>Password</label>
     <input type="password" name="password" ref={passwordRef} />
    </div>

    <button type="submit" onClick={async () => await loginWithEmailAndPassword(emailRef.current!.value, passwordRef.current!.value, (searchParams ? searchParams.get("next") ?? undefined : undefined))}>Login</button>
   </form>
  </div >
 );
}