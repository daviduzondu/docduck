import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';


// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { CharacterCount, Placeholder, Selection } from "@tiptap/extensions"
import { EditorContext, useEditor } from '@tiptap/react'
import { TextStyleKit } from '@tiptap/extension-text-style'

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

import SearchAndReplace from "@/lib/search-and-replace.extension";
import { useEffect, useMemo } from 'react';
import { useDocument } from '@/providers/document.provider';
import Comment from '@/lib/comment.extension';
import * as Y from 'yjs';
import { useEditorSidebarView } from '@/providers/editor-sidebar.provider';
import { useSidebar } from '@/components/ui/sidebar';


export default function TipTapEditorProvider({ children, canEdit }: { children: React.ReactNode, canEdit: boolean }) {
 const { provider, ydoc } = useDocument();
 const { view, setView } = useEditorSidebarView();
 const { open, setOpen  } = useSidebar();
 const editor = useEditor({
  immediatelyRender: false,
  editable: canEdit,
  editorProps: {
   handleClick(view, pos, event) {
    if (!canEdit) return false;
    const { state } = view
    const $pos = state.doc.resolve(pos)

    const marks = $pos.marks()
    const hasComment = marks.some(mark => mark.type.name === 'comment')

    if (hasComment) {
     setView('comments');
     setOpen(true);
     console.log(editor?.storage.comment.activeCommentId);
     return true
    }

    return false
   },
   attributes: {
    autocomplete: "off",
    autocorrect: "off",
    autocapitalize: "off",
    "aria-label": "Main content area, start typing to enter text.",
    class: "simple-editor min-h-screen h-full ",
   },
  },
  autofocus: true,
  extensions: [
   TextStyleKit,
   Comment.configure({
    HTMLAttributes: {
     class: 'comment'
    },
    activeCommentClass: 'active-comment',
    
   }),
   StarterKit.configure({
    horizontalRule: false,
    undoRedo: false,
    link: {
     openOnClick: false,
     enableClickSelection: true,
    },
   }),
   SearchAndReplace.configure({
    // searchResultClass: "search-result",
    caseSensitive: false,
    disableRegex: true,
   }),
   CollaborationCaret.configure({
    provider,
   }),
   Collaboration.configure({
    document: ydoc,
   }),
   Placeholder.configure({
    placeholder: "Start typing..."
   }),
   HorizontalRule,
   TextAlign.configure({ types: ["heading", "paragraph"] }),
   TaskList,
   CharacterCount.configure({
   }),
   TaskItem.configure({ nested: true }),
   Highlight.configure({ multicolor: true }),
   Image,
   Typography,
   Superscript,
   Subscript,
   Selection,
   ImageUploadNode.configure({
    accept: "image/*",
    maxSize: MAX_FILE_SIZE,
    limit: 3,
    upload: handleImageUpload,
    onError: (error) => console.error("Upload failed:", error),
   }),
  ],

  onSelectionUpdate: ({ editor }) => {
   // console.log('select update', editor.state.selection);
  },
 });

 const providerValue = useMemo(() => ({ editor }), [editor])

 return <EditorContext.Provider value={providerValue}>
  {children}
 </EditorContext.Provider>
}