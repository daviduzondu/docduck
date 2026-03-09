'use client'
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { useEffect } from "react";
import * as Y from 'yjs';

export default function NotePage() {
 const ydoc = new Y.Doc();
 const socket = new HocuspocusProviderWebsocket({
  url: 'http://localhost:1711/collab',
  onOpen(data) {
   console.log('connected!', data);
  },
 });

 const provider = new HocuspocusProvider({
  websocketProvider: socket,
  name: 'document-1',
  document: ydoc
 })

 useEffect(() => {
  provider.attach();
  return () => provider.detach();
 }, []);

 return <SimpleEditor />
}