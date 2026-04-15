'use client'

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useParams } from "next/navigation";
import { EditorHeader } from "@/components/editor/editor-header";
import { Button } from "@/components/ui/button";
import { History, MessageSquare, Search } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import EditorSidebar from "@/components/editor/sidebar/editor-sidebar";
import { useEditorSidebarView } from "@/providers/editor-sidebar.provider";
import TipTapEditorProvider from "@/providers/editor.provider";
import { useCurrentEditor } from "@tiptap/react";
import { useDocument } from "@/providers/document.provider";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc.client";
import { useShallow } from 'zustand/react/shallow';
import Diff from "@/components/editor/diff-viewer";

export default function DocPage({ canEdit, role }: { canEdit: boolean, role: "VIEWER" | "EDITOR" | "OWNER" | undefined }) {
 const { noteId }: { noteId: string } = useParams();
 const { toggleSidebar, open } = useSidebar();
 const { view: currentView, setView } = useEditorSidebarView();
 const { editor } = useCurrentEditor();
 const mode = useDocument(state => state.mode)

 if (!noteId) throw new Error("Invalid document ID.");
 function handleSidebar(newView: typeof currentView, onClose?: () => void) {
  if (!open) toggleSidebar();
  if (open && newView === currentView) {
   setView(undefined);
   toggleSidebar();
   onClose && onClose();
  }
  setView(newView);
 }


 return <main className="flex-1 relative">
  {/* <div className="w-full text-center text-sm py-2">You're currently offline. Changes will sync automatically.</div> */}
  <div className="h-screen flex flex-col">
   <TipTapEditorProvider canEdit={canEdit}>
    <EditorHeader canEdit={canEdit} />
    <div className="flex flex-1 relative ">
     {/* Main editor area */}
     <div className="flex-1 relative">
      {mode === 'editor' ? <SimpleEditor canEdit={canEdit} role={role} /> : <Diff />}

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
        onClick={() => handleSidebar('search', () => {
         editor?.commands.setSearchTerm('')
         editor?.commands.setReplaceTerm('')
        })}
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
   </TipTapEditorProvider>
  </div>
 </main>
}
