'use client'

import { orpc } from "@/lib/orpc.client";
import { useDocument } from "@/providers/document.provider";
import { useQuery } from "@tanstack/react-query";
import Collaboration from "@tiptap/extension-collaboration";
import { Content, EditorContent, useCurrentEditor, useEditor } from "@tiptap/react";
import { Editor } from '@tiptap/core';
import StarterKit from "@tiptap/starter-kit";
import * as Y from 'yjs';
import { useShallow } from "zustand/react/shallow";
import { fromUint8Array, toUint8Array } from 'js-base64';
import Comment from '@/lib/comment.extension';
import { Image } from "@tiptap/extension-image"

import { yDocToProsemirrorJSON, yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node";
import { MAX_FILE_SIZE, handleImageUpload } from "@/lib/tiptap-utils";
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

export default function Diff() {
 const { mode, documentId, snapshotId } = useDocument(
  useShallow(state => ({
   mode: state.mode,
   documentId: state.documentId,
   snapshotId: state.snapshotId
  }))
 );
 const getSnapshotByIdQuery = useQuery(orpc.documents.getSnapshotById.queryOptions({
  input: {
   params: { documentId, snapshotId }
  },

 }))

 if (getSnapshotByIdQuery.isPending) return <div>Loading...</div>;
 if (getSnapshotByIdQuery.error) return <div>Something went wrong...</div>;
 if (getSnapshotByIdQuery.data) {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, toUint8Array(getSnapshotByIdQuery.data.yjsState));
  return <Viewer document={doc} />
 }
}

function Viewer({ document }: { document: Y.Doc }) {
 const provider = useDocument(state => state.provider);
 const { editor: currentEditor } = useCurrentEditor();
 console.log(yXmlFragmentToProseMirrorRootNode(provider.document.getXmlFragment('default'), currentEditor!.schema).toJSON())
 const editor = new Editor({
  editorProps: {
   editable: () => false,
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
  <EditorContent
   editor={editor}
   role="presentation"
   className="simple-editor-content rounded-sm border h-full min-h-full relative"
  />
 </div>
}