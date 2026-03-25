'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "../../hooks/use-hocuspocus";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "../../guards/auth.guard";
import { useEffect } from "react";


export default function NotePage() {
 const { noteId }: { noteId: string } = useParams();
 if (!noteId) throw new Error("Invalid document ID.");

 const { ydoc, provider } = useHocuspocus(noteId);

 if (ydoc && provider)
  return <div>
   Document name: Test
   <AuthGuard next={"/doc/" + noteId}>
    <SimpleEditor ydoc={ydoc} provider={provider} />
   </AuthGuard>

  </div>
}