import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useSidebar } from "@/components/ui/sidebar";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useEditorSidebarView } from "@/providers/editor-sidebar.provider";
import { useCurrentEditor } from "@tiptap/react";
import { LetterText, Regex, ReplaceAll, SearchXIcon } from "lucide-react";
import { Ref, useEffect, useRef, useState } from "react";

export default function FindAndReplace() {
 const { editor } = useCurrentEditor();
 const { open } = useSidebar();
 const searchInputRef = useRef<HTMLInputElement | null>(null);
 const replaceInputRef = useRef<HTMLInputElement | null>(null);
 const [results, setResults] = useState(editor?.storage.searchAndReplace.results || []);

 useEffect(() => {
  if (!open && editor) editor.commands.setSearchTerm('');
  if (open && searchInputRef) editor?.commands.setSearchTerm(searchInputRef.current!.value)
 }, [open]);

 useEffect(() => {
  editor?.on('update', () => {
   setResults([...editor.storage.searchAndReplace.results]);
  });
 }, []);

 return (
  <div className="flex flex-col h-full overflow-hidden">
   <div className="flex flex-col space-y-2.5 shrink-0 px-1 my-2">
    <InputGroup>
     <InputGroupInput
      placeholder="Search..."
      ref={searchInputRef}
      onChange={(e) => {
       if (!editor) return;
       editor.commands.setSearchTerm(e.target.value);
       setResults([...editor.storage.searchAndReplace.results]);
      }}
      onKeyDown={(e) => {
       if (!editor) return;
       if (e.key === "Enter") editor.commands.nextSearchResult();
      }}
     />
     <InputGroupAddon align="inline-end" className="flex -space-x-2 pr-1.5">
      <Toggle
       title="Match case"
       onPressedChange={(pressed) => {
        editor?.commands.setCaseSensitive(pressed);
        editor && setResults([...editor.storage.searchAndReplace.results]);
       }}
       render={(props, state) => (
        <Button {...Object.assign(props, { className: "" })} variant={state.pressed ? 'default' : 'ghost'} size="icon-sm">
         <LetterText />
        </Button>
       )}
      />
      <Toggle
       title="Use Regex"
       onPressedChange={(pressed) => {
        editor?.commands.setRegexMode(pressed);
        editor && setResults([...editor.storage.searchAndReplace.results]);
       }}
       render={(props, state) => (
        <Button {...Object.assign(props, { className: "" })} variant={state.pressed ? 'default' : 'ghost'} size="icon-sm">
         <Regex />
        </Button>
       )}
      />
     </InputGroupAddon>
    </InputGroup>

    <InputGroup>
     <InputGroupInput
      placeholder="Replace..."
      ref={replaceInputRef}
      onKeyDown={(e) => {
       if (!editor) return;
       if (e.key === "Enter" && editor.storage.searchAndReplace.searchTerm) {
        editor.commands.setReplaceTerm((e.target as HTMLInputElement).value);
        editor.storage.searchAndReplace.replaceAllMode
         ? editor.commands.replaceAll()
         : editor.commands.replace();
       }
      }}
     />
     <InputGroupAddon align="inline-end" className="pr-1.5">
      <Toggle
       title="Replace all"
       onPressedChange={(pressed) => {
        editor?.commands.setReplaceAllMode(pressed);
        editor && setResults([...editor.storage.searchAndReplace.results]);
       }}
       render={(props, state) => (
        <Button {...Object.assign(props, { className: "" })} variant={state.pressed ? 'default' : 'ghost'} size="icon-sm">
         <ReplaceAll />
        </Button>
       )}
      />
     </InputGroupAddon>
    </InputGroup>
    {results.length > 0 ? <p className="text-sm text-muted-foreground text-center">
     {results.length} {results.length === 1 ? "result" : "results"} found
    </p> : null}
   </div>

   <div className="flex flex-col gap-3 flex-1 overflow-y-auto px-1 pt-2">
    {results.length > 0 ? (
     <>

      {editor && results.map((r: any, i: number) => {
       const docSize = editor.state.doc.content.size;
       const contextFrom = Math.max(0, r.from - 70);
       const contextTo = Math.min(docSize, r.to + 70);
       const before = editor.state.doc.textBetween(contextFrom, r.from, " ");
       const match = editor.state.doc.textBetween(r.from, r.to, " ");
       const after = editor.state.doc.textBetween(r.to, contextTo, " ");

       if (!match) return null;

       return (
        <Card key={`${r.from}-${r.to}-${i}`} className="rounded-xl shrink-0 cursor-pointer p-2" onClick={() => {
         editor
          .chain()
          .setTextSelection({ from: r.from, to: r.to })
          .scrollIntoView()
          .focus()
          .run();
        }}>
         <CardContent className="p-2 text-sm leading-relaxed">
          <span className="text-muted-foreground">{before}</span>
          <mark className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded px-0.5 mx-0.5">
           {match}
          </mark>
          <span className="text-muted-foreground">{after}</span>
         </CardContent>
        </Card>
       );
      })}
     </>
    ) : searchInputRef.current && searchInputRef.current?.value.trim().length >= 1 ? (
     <Empty>
      <EmptyHeader>
       <EmptyMedia variant="icon">
        <SearchXIcon />
       </EmptyMedia>
       <EmptyTitle>No results found</EmptyTitle>
       <EmptyDescription>Try a different search term.</EmptyDescription>
      </EmptyHeader>
     </Empty>
    ) : null}
   </div>

  </div>
 );
}