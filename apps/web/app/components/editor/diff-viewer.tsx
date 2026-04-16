'use client'

import { orpc } from "@/lib/orpc.client";
import { useDocument } from "@/providers/document.provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EditorContent, useCurrentEditor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from 'yjs';
import { useShallow } from "zustand/react/shallow";
import { toUint8Array } from 'js-base64';
import Comment from '@/lib/comment.extension';
import { Image } from "@tiptap/extension-image"
import { yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import { TextStyleKit } from "@tiptap/extension-text-style";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { Placeholder, CharacterCount, Selection } from "@tiptap/extensions";
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { stripMarks } from "@/lib/utils";
import ComparePlugin from "@/lib/compare.extension";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/components/tiptap-templates/simple/simple-editor.scss"
import { Loader } from "lucide-react";


export default function Diff() {
 const queryClient = useQueryClient();
 const { mode, documentId, snapshotId } = useDocument();
 const getSnapshotByIdQuery = useQuery(orpc.documents.getSnapshotById.queryOptions({
  input: {
   params: { documentId, snapshotId }
  },
 }))

 if (getSnapshotByIdQuery.isPending) return <div className="flex w-full items-center justify-center h-screen"><span><Loader className="animate-spin"/></span></div>;
 if (getSnapshotByIdQuery.error) return <div className="flex w-full items-center justify-center h-screen">Something went wrong...</div>;
 if (getSnapshotByIdQuery.data) {
  queryClient.invalidateQueries({
   queryKey: orpc.documents.getSnapshotById.queryKey({
    input: {
     params: { documentId, snapshotId }
    },
   })
  })
  const doc = new Y.Doc();
  Y.applyUpdate(doc, toUint8Array(getSnapshotByIdQuery.data.yjsState));
  return <Viewer document={doc} />
 }
}

function Viewer({ document }: { document: Y.Doc }) {
 const provider = useDocument(state => state.provider);
 const { editor: currentEditor } = useCurrentEditor();
 const editor = useEditor({
  immediatelyRender: true,
  editorProps: {
   editable: () => false,
   attributes: {
    class: "simple-editor min-h-screen h-full",
   }
  },
  content: stripMarks(yXmlFragmentToProseMirrorRootNode(document.getXmlFragment('default'), currentEditor!.schema).toJSON(), new Set(['comment'])),
  extensions: [
   TextStyleKit,
   Comment.configure({
    HTMLAttributes: {
     class: 'comment'
    },
    activeCommentClass: 'active-comment'
   }),
   StarterKit.configure({
    horizontalRule: false,
    undoRedo: false,
    link: {
     openOnClick: false,
     enableClickSelection: true,
    },
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
   ComparePlugin.configure({
    comparisonContent: stripMarks(yXmlFragmentToProseMirrorRootNode(provider.document.getXmlFragment('default'), currentEditor!.schema).toJSON(), new Set(['comment'])),
   }),

  ],
 });

 return <div className="simple-editor-wrapper">
  <div>
   <EditorContent
    editor={editor}
    role="presentation"
    className="simple-editor-content rounded-sm border h-full min-h-full relative"
   />
  </div>
 </div>
}