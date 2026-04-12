'use client'

import { StatelessMessage } from "@/types";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import React, { useContext, useEffect, useState } from "react";
import * as Y from 'yjs';
import { string } from "zod";

type DocumentContext = { title: string | undefined, documentId: string | null, ydoc: Y.Doc | null, provider: HocuspocusProvider | null };
export const HocuspocusContext = React.createContext<DocumentContext>({ title: undefined, documentId: null, ydoc: null, provider: null });

export function DocumentProvider({ documentId, title, children }: { title: string, documentId: string, children: React.ReactNode }) {
 const [data, setData] = useState<DocumentContext>({ title, ydoc: null, provider: null, documentId });

 useEffect(() => {
  const ydoc = new Y.Doc();
  const socket = new HocuspocusProviderWebsocket({
   url: `http://localhost:1711/collab`,// TODO: replace 
  });
  

  const provider = new HocuspocusProvider({
   websocketProvider: socket,
   name: documentId,
   document: ydoc,
   onAuthenticationFailed(data) {
    console.error("Authentication failed. You must be signed in to perform this action.")
   },
   onStateless({ payload }) {
    const message: StatelessMessage<string> = JSON.parse(payload);
    if (message.type === 'update:title') {
     setData(prev => ({ ...prev, title: message.data }))
    }
   },
  });
  provider.document.getMap('comments');
  provider.attach();

  setData(prev => ({ ...prev, ydoc, provider }))
  return () => {
   provider.detach();
  }
 }, [])

 if (data.ydoc && data.provider)
  return <HocuspocusContext.Provider value={data}>
   {children}
  </HocuspocusContext.Provider>
}

export function useDocument() {
 const { ydoc, provider, documentId, title } = useContext(HocuspocusContext);
 if (ydoc && provider && documentId && title) return { ydoc, provider, documentId, title };
 throw new Error("useHocuspocus must be called within a DocumentProvider.");
}