'use client'

import { StatelessMessage } from "@/types";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import React, { useContext, useEffect, useState } from "react";
import * as Y from 'yjs';
import { create, createStore, useStore } from 'zustand';


export const useDocumentStore = createStore<DocumentState & DocumentActions>((set) => ({
 title: undefined,
 documentId: undefined,
 ydoc: undefined,
 provider: undefined,
 mode: 'editor',
 snapshotId: undefined,
 setSnapshotId: (id) => set({ snapshotId: id }),
 setTitle: (title) => set({ title }),
 setMode(mode) {
  set({ mode })
 },
 initialize(documentId, title) {
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
     set({ title: message.data })
     // setData(prev => ({ ...prev, title: message.data }))
    }
   },
  });
  provider.attach()
  set({ ydoc, provider, documentId, title })
  // setData(prev => ({ ...prev, ydoc, provider }))
  return () => {
   provider.detach();
   socket.destroy();
   set({ ydoc: undefined, provider: undefined, documentId: undefined, title: undefined });
  }
 },
}));

export function useDocument<T = DocumentReadyState & DocumentActions>(
 selector?: (state: DocumentReadyState & DocumentActions) => T
) {
 const { ydoc, provider } = useDocumentStore.getState();

 if (!ydoc || !provider) throw new Error("useDocument must be called within a DocumentProvider.");

 return useStore(
  useDocumentStore,
  selector
   ? (state) => selector(state as unknown as DocumentReadyState & DocumentActions)
   : (state) => state as unknown as T
 );
}
export function DocumentProvider({
 documentId,
 title,
 children,
}: {
 title: string;
 documentId: string;
 children: React.ReactNode;
}) {
 const initialize = useStore(useDocumentStore, (s) => s.initialize)
 const ready = useStore(useDocumentStore, (s) => !!(s.ydoc && s.provider));

 useEffect(() => {
  const cleanup = initialize(documentId, title);
  return cleanup;
 }, [documentId]);

 if (!ready) return <span>Loading...</span>;

 return <>{children}</>;
}


type DocumentState = {
 title: string | undefined;
 documentId: string | undefined;
 ydoc: Y.Doc | undefined;
 provider: HocuspocusProvider | undefined;
 mode: "editor" | 'diff';
 snapshotId: string | undefined;
};

type DocumentReadyState = {
 title: string;
 documentId: string;
 ydoc: Y.Doc;
 provider: HocuspocusProvider;
 mode: 'editor' | 'diff'
 snapshotId: string;
}

type DocumentActions = {
 initialize: (documentId: string, title: string) => () => void;
 setTitle: (title: string) => void;
 setMode: (mode: 'editor' | 'diff') => void;
 setSnapshotId: (id: string) => void;
};
