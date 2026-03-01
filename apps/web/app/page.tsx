'use client'

import { useEffect, useState } from "react";
import { createAccountWithEmailAndPassword } from "./lib/auth-client";
import { socket } from '@/lib/socket';


export default function Home() {
 const [isConnected, setIsConnected] = useState(socket.connected);

 useEffect(() => {
  const onConnect = () => setIsConnected(true);
  const onDisconnect = () => setIsConnected(false);
  socket.on('connect', onConnect);
  return () => {
   socket.off('connect', onDisconnect);
  }
 }, []);

 return (
  <div>
   DocDuck
   <div>
    {isConnected ? "Connected" : "Disconnected"}
    {/* <button onClick={createAccountWithEmailAndPassword}>Create account</button> */}
   </div>
  </div>
 );
}
