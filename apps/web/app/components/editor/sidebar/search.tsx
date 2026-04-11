import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useSidebar } from "@/components/ui/sidebar";
import { Toggle } from "@/components/ui/toggle";
import { useEditorSidebarView } from "@/providers/editor-sidebar.provider";
import { useCurrentEditor } from "@tiptap/react";
import { LetterText, Regex, ReplaceAll } from "lucide-react";
import { Ref, useEffect, useRef } from "react";

export default function FindAndReplace() {
 const { editor } = useCurrentEditor();
 const { open } = useSidebar();
 const searchInputRef = useRef<HTMLInputElement | null>(null);
 const replaceInputRef = useRef<HTMLInputElement | null>(null)

 useEffect(() => {
  if (!open && editor) editor.commands.setSearchTerm('');
  if (open && searchInputRef) editor?.commands.setSearchTerm(searchInputRef.current!.value)
 }, [open]);

 return <form>
  <div className="flex flex-col space-y-2.5">
   <InputGroup>
    <InputGroupInput placeholder="Search..."
     ref={searchInputRef}
     onChange={(e) => {
      if (!editor) return;
      editor.commands.setSearchTerm(e.target.value);
     }}
     onKeyDown={(e) => {
      if (!editor) return;
      if (e.key === "Enter") {
       editor.commands.nextSearchResult()
      }
      // editor.commands.
     }} />
    <InputGroupAddon align={"inline-end"} className={'flex -space-x-2 pr-1.5'}>
     <Toggle className={'p-1'} title="Match caee">
      <LetterText />
     </Toggle>
     <Toggle className={'p-1'} title="Use RegEx">
      <Regex />
     </Toggle>
    </InputGroupAddon>
   </InputGroup>
   <InputGroup>
    <InputGroupInput placeholder="Replace..."
     ref={replaceInputRef}
     onKeyDown={(e) => {
      if (!editor) return;
      if (e.key === "Enter" && editor.storage.searchAndReplace.searchTerm) {
       // editor.commands.setReplaceTerm((e.target as HTMLInputElement).value);
       // editor.commands.replace();
       // editor.commands.resetSearchAndReplace();
      }
     }}
    />
    <InputGroupAddon align={"inline-end"} className={'pr-1.5'}>
     <Toggle size={'icon-sm'} title="Replace all">
      <ReplaceAll />
     </Toggle>
    </InputGroupAddon>
   </InputGroup>
  </div>
 </form>
}