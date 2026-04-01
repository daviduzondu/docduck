'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "../../../hooks/use-hocuspocus";
import { useParams } from "next/navigation";
import AuthGuard from "../../../guards/auth.guard";
import { EditorHeader } from "../../../components/editor/editor-header";
import { Button } from "@/components/ui/button";
import { History, MessageSquare, Search } from "lucide-react";
import { useSidebar } from "../../../components/ui/sidebar";

export default function NotePage() {
 const { noteId }: { noteId: string } = useParams();
 const { toggleSidebar } = useSidebar();
 if (!noteId) throw new Error("Invalid document ID.");

 const { ydoc, provider } = useHocuspocus(noteId);

 if (ydoc && provider)

  return <main className="flex-1 relative">
   {/* <div className="w-full text-center text-sm py-2">You're currently offline. Changes will sync automatically.</div> */}
   <AuthGuard next={"/doc/" + noteId}>
    <EditorHeader />
    <SimpleEditor ydoc={ydoc} provider={provider} />
    <div className="absolute bottom-10 right-3 flex flex-col gap-3">
     <Button size={'icon-xl'}><MessageSquare /></Button>
     <Button size={'icon-xl'}><History /></Button>
     <Button size={'icon-xl'} onClick={toggleSidebar}><Search /></Button>
     {/* <SearchDrawer /> */}
    </div>
   </AuthGuard>
  </main>
}
