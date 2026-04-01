'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "../../hooks/use-hocuspocus";
import { useParams } from "next/navigation";
import AuthGuard from "../../guards/auth.guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
 Avatar,
 AvatarFallback,
 AvatarGroup,
 AvatarImage,
} from "@/components/ui/avatar"
import { Share2 } from 'lucide-react';

export default function NotePage() {
 const { noteId }: { noteId: string } = useParams();
 if (!noteId) throw new Error("Invalid document ID.");

 const { ydoc, provider } = useHocuspocus(noteId);

 if (ydoc && provider)
  return <main>
   {/* <div className="w-full text-center text-sm py-2">You're currently offline. Changes will sync automatically.</div> */}
   <header className="flex w-full items-center px-3 py-1 justify-between">
    <div className="text-2xl font-bold grow basis-0 ">DocDuck</div>
    <div className="w-[25%] text-center space-x-1">
     <div className="truncate text-center inline">Quarterly Report (Q3 2024)</div>
     <Badge className="uppercase text-xs inline" variant={'default'}>private</Badge>
    </div>
    <div className="gap-2 items-center flex grow basis-0 justify-end">
     <AvatarGroup className="">
      <Avatar>
       <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
       <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
       <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
       <AvatarFallback>LR</AvatarFallback>
      </Avatar>
      <Avatar>
       <AvatarImage
        src="https://github.com/evilrabbit.png"
        alt="@evilrabbit"
       />
       <AvatarFallback>ER</AvatarFallback>
      </Avatar>
     </AvatarGroup>
     <Button size={'lg'}><Share2 data-icon="inline-end" />Share</Button>
    </div>
   </header>
   <AuthGuard next={"/doc/" + noteId}>
    <SimpleEditor ydoc={ydoc} provider={provider} />
   </AuthGuard>

  </main>
}