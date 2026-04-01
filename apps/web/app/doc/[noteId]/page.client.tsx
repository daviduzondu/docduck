'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "../../hooks/use-hocuspocus";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "../../guards/auth.guard";
import { Button } from "../../components/ui/button";


export default function NotePage() {
 const { noteId }: { noteId: string } = useParams();
 if (!noteId) throw new Error("Invalid document ID.");

 const { ydoc, provider } = useHocuspocus(noteId);

 if (ydoc && provider)
  return <main>
   {/* <div className="w-full text-center text-sm py-2">You're currently offline. Changes will sync automatically.</div> */}
   <header className="flex w-full items-center px-3 py-1 justify-between">
    <div className="text-2xl font-bold grow basis-0 ">DocDuck</div>
    <div className="w-[25%] text-center">
     <div className="truncate text-center">Quarterly Report (Q3 2024)</div>
    </div>
    <div className="gap-2  items-center grow basis-0 text-right">
     [collaborators]
     <Button>Share</Button>
    </div>
   </header>
   <AuthGuard next={"/doc/" + noteId}>
    <SimpleEditor ydoc={ydoc} provider={provider} />
   </AuthGuard>

  </main>
}