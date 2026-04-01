'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "../../hooks/use-hocuspocus";
import { useParams } from "next/navigation";
import AuthGuard from "../../guards/auth.guard";
import { EditorHeader } from "../../components/editor/editor-header";
import { Button } from "@/components/ui/button";
import { History, MessageSquare, Search } from "lucide-react";

export default function NotePage() {
 const { noteId }: { noteId: string } = useParams();
 if (!noteId) throw new Error("Invalid document ID.");

 const { ydoc, provider } = useHocuspocus(noteId);

 if (ydoc && provider)
  return <main>
   {/* <div className="w-full text-center text-sm py-2">You're currently offline. Changes will sync automatically.</div> */}
   <EditorHeader />
   <AuthGuard next={"/doc/" + noteId}>
    <SimpleEditor ydoc={ydoc} provider={provider} />
   </AuthGuard>
   <div className="absolute bottom-10 right-3 flex flex-col gap-3">
    <Button size={'icon-xl'}><MessageSquare /></Button>
    <Button size={'icon-xl'}><History /></Button>
    <Button size={'icon-xl'}><Search /></Button>
   </div>
  </main>
}