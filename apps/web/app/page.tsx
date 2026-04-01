'use client'

import { Button } from "./components/ui/button";


export default function Home() {
 return (
  <div>
   <div className="text-3xl font-bold">DocDuck</div>;
   <div>
    <Button>Button</Button>
    {/* <button onClick={createAccountWithEmailAndPassword}>Create account</button> */}
   </div>
  </div>
 );
}