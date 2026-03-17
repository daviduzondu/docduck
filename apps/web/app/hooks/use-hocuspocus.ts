import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { authClient } from '../lib/auth-client';

function initHocuspocus() {
 const ydoc = new Y.Doc();
 const socket = new HocuspocusProviderWebsocket({
  url: `http://localhost:1711/collab`,
 });


 const provider = new HocuspocusProvider({
  websocketProvider: socket,
  name: 'document-1',
  document: ydoc,
  onAuthenticationFailed() {
   console.error("Authentication failed. You must be signed in to perform this action.")
  },
 })
 return { ydoc, provider }
}

export default function useHocuspocus() {
 const [data, setData] = useState<{ ydoc: Y.Doc | null, provider: HocuspocusProvider | null }>({ ydoc: null, provider: null })
 // const data = useMemo(() => initHocuspocus(), []);

 useEffect(() => {
  const ydoc = new Y.Doc();
  const socket = new HocuspocusProviderWebsocket({
   url: `http://localhost:1711/collab`,
  });


  const provider = new HocuspocusProvider({
   websocketProvider: socket,
   name: 'document-1',
   document: ydoc,
   onAuthenticationFailed() {
    alert("You need to be authenticated!");
    console.error("Authentication failed. You must be signed in to perform this action.")
   },
  });

  provider.attach();

  setData({ ...data, ydoc, provider })
  return () => {
   provider.detach();
  }
  // console.log(document.cookie);
 }, [])

 return data;
}