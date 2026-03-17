'use client'
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import useHocuspocus from "../../hooks/use-hocuspocus";


export default function NotePage() {
 const { ydoc, provider } = useHocuspocus();
 if (ydoc && provider)
 return <div>
  Document name: Test Document
  <SimpleEditor ydoc={ydoc} provider={provider} /></div>
}