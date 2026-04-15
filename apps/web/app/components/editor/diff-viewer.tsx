import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import * as Y from 'yjs';

export default function DiffViewer(fragment: Y.XmlFragment) {
 const editor = useEditor({
  extensions: [
   Collaboration.configure({
    fragment,
   })
  ]
 });

 return <div className="simple-editor-wrapper">
  <EditorContent
   editor={editor}
   role="presentation"
   className="simple-editor-content rounded-sm border h-full min-h-full relative"
  />
 </div>
}