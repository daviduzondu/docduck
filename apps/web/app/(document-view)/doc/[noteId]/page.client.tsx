'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "@/hooks/use-hocuspocus";
import { useParams } from "next/navigation";
import { EditorHeader } from "@/components/editor/editor-header";
import { Button } from "@/components/ui/button";
import { History, MessageSquare, Search } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import EditorSidebar from "@/components/editor/editor-sidebar";
import { useEditorSidebarView } from "@/providers/editor-sidebar.provider";

// function sidebarHandler(view:) { }

export default function NotePage() {
 const { noteId }: { noteId: string } = useParams();
 const { toggleSidebar, open } = useSidebar();
 const { view: currentView, setView } = useEditorSidebarView();
 if (!noteId) throw new Error("Invalid document ID.");
 const { ydoc, provider } = useHocuspocus(noteId);
 function handleSidebar(newView: typeof currentView) {
  if (!open) toggleSidebar();
  if (open && newView === currentView) {
   setView(undefined);
   toggleSidebar();
  }
  setView(newView);
 }


 if (ydoc && provider)
  return <main className="flex-1 relative">
   {/* <div className="w-full text-center text-sm py-2">You're currently offline. Changes will sync automatically.</div> */}
   <div className="h-screen flex flex-col">
    <EditorHeader />
    <div className="flex flex-1 relative">
     {/* Main editor area */}
     <div className="flex-1 relative">
      <SimpleEditor ydoc={ydoc} provider={provider} />

      {/* Floating buttons */}
      <div className="absolute bottom-22 right-3 flex flex-col gap-3">
       <Button
        onClick={() => handleSidebar('comments')}
        className="bg-foreground text-background dark:hover:text-foreground" size="icon-lg">
        <MessageSquare />
       </Button>
       <Button
        onClick={() => handleSidebar('history')}
        className="bg-foreground text-background dark:hover:text-foreground" size="icon-lg">
        <History />
       </Button>
       <Button
        onClick={() => handleSidebar('search')}
        className="bg-foreground text-background dark:hover:text-foreground"
        size="icon-lg"
       >
        <Search />
       </Button>
      </div>
     </div>
     {/* Sidebar */}
     <EditorSidebar view={currentView} />
    </div>
   </div>
  </main>
}
