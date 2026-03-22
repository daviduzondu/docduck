'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "../../hooks/use-hocuspocus";
import { useParams } from "next/navigation";


export default function NotePage() {
 const { noteId }: { noteId: string } = useParams();
 if (!noteId) throw new Error("Invalid document ID.");

 const { ydoc, provider } = useHocuspocus(noteId);

 if (ydoc && provider)
  return <div>
   Document name: Test Document
   <SimpleEditor ydoc={ydoc} provider={provider} /></div>
}