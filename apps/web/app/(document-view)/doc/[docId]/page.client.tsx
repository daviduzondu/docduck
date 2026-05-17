'use client'

import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { useParams } from 'next/navigation'
import { EditorHeader } from '@/components/editor/editor-header'
import { Button } from '@/components/ui/button'
import { History, MessageSquare, Search } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import EditorSidebar from '@/components/editor/sidebar/editor-sidebar'
import { useEditorSidebarView } from '@/providers/editor-sidebar.provider'
import { useCurrentEditor } from '@tiptap/react'
import { useDocument } from '@/providers/document.provider'
import Diff from '@/components/editor/diff-viewer'
import { useEffect, useState } from 'react'
import { StatelessMessage } from '@/types'
import { useAuth } from '@/providers/auth.provider'
import { toast } from 'sonner'

export default function DocPage({
 initialCanEdit,
 initialRole,
 visibility,
}: {
 initialCanEdit: boolean
 visibility: 'PUBLIC' | 'PRIVATE'
 initialRole: 'VIEWER' | 'EDITOR' | 'OWNER' | undefined
}) {
 const { docId }: { docId: string } = useParams()
 const { toggleSidebar, open } = useSidebar()
 const { view: currentView, setView } = useEditorSidebarView()
 const { editor } = useCurrentEditor()
 const mode = useDocument((state) => state.mode)
 const provider = useDocument((state) => state.provider)
 const [role, setRole] = useState(initialRole)
 const [canEdit, setCanEdit] = useState(initialCanEdit)
 const { data: authData } = useAuth()

 if (!docId) throw new Error('Invalid document ID.')
 function handleSidebar(newView: typeof currentView, onClose?: () => void) {
  if (!open) toggleSidebar()
  if (open && newView === currentView) {
   setView(undefined)
   toggleSidebar()
   onClose && onClose()
  }
  setView(newView)
 }

 useEffect(() => {
  const handleStatelessMessage = async ({ payload }: { payload: string }) => {
   const message: StatelessMessage<Record<string, string>> = JSON.parse(payload)
   if (
    message.type === 'role:update' &&
    message.data?.userId === authData?.user.id &&
    editor
   ) {
    const newRole = message.data.newRole as typeof role
    setRole(newRole)
    setCanEdit(newRole === 'EDITOR')
    editor.setEditable(newRole === 'EDITOR', true);
    toast.info(
     'The document owner changed your role to ' + newRole?.toLowerCase() + '.'
    )
    // console.log(editor)
    // const reloadApproved = await confirm({
    //  title: 'Your role has changed',
    //  description:
    //   "The document owner changed your role, so you'd have to reload this document to apply changes.",
    //  confirmLabel: 'Sure, reload',
    // })
    // if (reloadApproved) {
    //  window.location.reload()
    // }
   }
  }

  provider.on('stateless', handleStatelessMessage)
  return () => {
   provider.off('stateless', handleStatelessMessage)
  }
 }, [provider, confirm, authData?.user.id, editor])

 return (
  <main className="flex-1 relative">
   {/* <div className="w-full text-center text-sm py-2">You're currently offline. Changes will sync automatically.</div> */}
   <div className="h-screen flex flex-col">
    {/* <TipTapEditorProvider canEdit={canEdit}> */}
    <EditorHeader canEdit={canEdit} visibility={visibility} />
    <div className="flex flex-1 relative ">
     {/* Main editor area */}
     <div className="flex-1 relative">
      {mode === 'editor' ? (
       <SimpleEditor canEdit={canEdit} role={role} />
      ) : (
       <Diff />
      )}

      {/* Floating buttons */}
      <div className="absolute bottom-22 right-3 flex flex-col gap-3">
       <Button
        disabled={!canEdit}
        onClick={() => handleSidebar('comments')}
        className="bg-foreground text-background dark:hover:text-foreground"
        size="icon-lg"
       >
        <MessageSquare />
       </Button>
       <Button
        onClick={() => handleSidebar('history')}
        disabled={!canEdit}
        className="bg-foreground text-background dark:hover:text-foreground"
        size="icon-lg"
       >
        <History />
       </Button>
       <Button
        onClick={() =>
         handleSidebar('search', () => {
          editor?.commands.setSearchTerm('')
          editor?.commands.setReplaceTerm('')
         })
        }
        className="bg-foreground text-background dark:hover:text-foreground"
        size="icon-lg"
       >
        <Search />
       </Button>
      </div>
     </div>
     {/* Sidebar */}
     <EditorSidebar view={currentView} canEdit={canEdit} />
    </div>
    {/* </TipTapEditorProvider> */}
   </div>
  </main>
 )
}
