import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';

export default function useHocuspocus(id: string) {
 const [data, setData] = useState<{ ydoc: Y.Doc | null, provider: HocuspocusProvider | null }>({ ydoc: null, provider: null })

 useEffect(() => {
  const ydoc = new Y.Doc();
  const socket = new HocuspocusProviderWebsocket({
   url: `http://localhost:1711/collab`,
  });

  const provider = new HocuspocusProvider({
   websocketProvider: socket,
   name: id,
   document: ydoc,
   onAuthenticationFailed(data) {
    console.log(data);
    alert("You need to be authenticated!");
    console.error("Authentication failed. You must be signed in to perform this action.")
   },
   onStateless(data) {
    console.log(data.payload)
   },
  });

  provider.sendStateless("HI")
  provider.attach();

  setData({ ...data, ydoc, provider })
  return () => {
   provider.detach();
  }
  // console.log(document.cookie);
 }, [])

 return data;
}