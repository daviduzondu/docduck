'use client'

import { StatelessMessage } from "@/types";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import React, { useContext, useEffect, useState } from "react";
import * as Y from 'yjs';

export const HocuspocusContext = React.createContext<{ ydoc: Y.Doc | null, provider: HocuspocusProvider | null }>({ ydoc: null, provider: null });

export function DocumentProvider({ documentId, children }: { documentId: string, children: React.ReactNode }) {
 const [data, setData] = useState<{ ydoc: Y.Doc | null, provider: HocuspocusProvider | null }>({ ydoc: null, provider: null });

 useEffect(() => {
  const ydoc = new Y.Doc();
  const socket = new HocuspocusProviderWebsocket({
   url: `http://localhost:1711/collab`,
  });

  const provider = new HocuspocusProvider({
   websocketProvider: socket,
   name: documentId,
   document: ydoc,
   onAuthenticationFailed(data) {
    console.error("Authentication failed. You must be signed in to perform this action.")
   },
   onStateless(data) {
    const message: StatelessMessage<string> = JSON.parse(data.payload);
    console.log('hi!')
    if (message.type === 'update:title') {
     console.log(message.data)
    }
   },
  });

  provider.attach();

  setData({ ...data, ydoc, provider })
  return () => {
   provider.detach();
  }
 }, [])

 if (data.ydoc && data.provider)
  return <HocuspocusContext.Provider value={data}>
   {children}
  </HocuspocusContext.Provider>
}

export function useHocuspocus() {
 const { ydoc, provider } = useContext(HocuspocusContext);
 if (ydoc && provider) return { ydoc, provider };
 throw new Error("useHocuspocus must be called within a DocumentProvider.");
}