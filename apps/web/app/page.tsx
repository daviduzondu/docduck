'use client'

import { useEffect, useState } from "react";
import { createAccountWithEmailAndPassword } from "./lib/auth-client";
import useHocuspocus from "./hooks/use-hocuspocus";

export default function Home() {
 return (
  <div>
   <div>DocDuck</div>;
   <div>
    {/* <button onClick={createAccountWithEmailAndPassword}>Create account</button> */}
   </div>
  </div>
 );
}