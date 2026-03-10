import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { useEffect, useMemo } from 'react';
import * as Y from 'yjs';

function initHocuspocus() {
 const ydoc = new Y.Doc();
 const hostname = location.hostname;
 const socket = new HocuspocusProviderWebsocket({
  url: `http://${hostname}:1711/collab`,
 });

 const provider = new HocuspocusProvider({
  websocketProvider: socket,
  name: 'document-1',
  document: ydoc
 })
 return { ydoc, provider }
}

export default function useHocuspocus() {
 const { provider, ydoc } = useMemo(() => initHocuspocus(), []);

 useEffect(()=>{
  console.log('re-render!')
 })

 useEffect(() => {
  provider.attach();
  return () => {
   provider.detach();
  }
 }, []);

 return { provider, ydoc };
}