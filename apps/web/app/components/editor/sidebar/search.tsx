import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { LetterText, Regex, ReplaceAll } from "lucide-react";

export default function FindAndReplace() {
 return <form>
  <div className="flex flex-col space-y-2.5">
   <InputGroup>
    <InputGroupInput placeholder="Search..." />
    <InputGroupAddon align={"inline-end"} className={'flex -space-x-2 pr-1.5'}>
     <InputGroupButton className={'p-1'} size={'icon-sm'} title="Replace all">
      <LetterText />
     </InputGroupButton>
     <InputGroupButton className={'p-1'} size={'icon-sm'} title="Replace all">
      <Regex />
     </InputGroupButton>
    </InputGroupAddon>
   </InputGroup>
   <InputGroup>
    <InputGroupInput placeholder="Replace..." />
    <InputGroupAddon align={"inline-end"} className={'pr-1.5'}>
     <InputGroupButton size={'icon-sm'} title="Replace all">
      <ReplaceAll />
     </InputGroupButton>
    </InputGroupAddon>
   </InputGroup>
  </div>
 </form>
}