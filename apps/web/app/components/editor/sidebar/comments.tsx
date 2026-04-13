import { useDocument } from "@/providers/document.provider";
import { useCurrentEditor } from "@tiptap/react";

export default function Comments() {
 const { editor } = useCurrentEditor();
 const { provider } = useDocument();

}