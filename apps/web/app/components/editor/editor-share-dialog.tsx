import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Link, LockIcon, Mail, User, UserRoundPlus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
 Select,
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";

import {
 Empty,
 EmptyContent,
 EmptyDescription,
 EmptyHeader,
 EmptyMedia,
 EmptyTitle,
} from "@/components/ui/empty"

import {
 Item,
 ItemActions,
 ItemContent,
 ItemDescription,
 ItemMedia,
 ItemTitle,
} from "@/components/ui/item"
import { useState } from "react"

const roles = [{ label: "Editor", value: "editor" }, { label: "Viewer", value: "viewer" }];

export function EditorShareDialogButton({ onShare }: { onShare: any }) {
 const [copied, setCopied] = useState(false);
 const handleCopy = async (textToCopy: string) => {
  try {
   await navigator.clipboard.writeText(textToCopy);
   setCopied(true);
   setTimeout(() => setCopied(false), 2000);
  } catch (err) {
   console.error('Failed to copy: ', err);
  }
 }

 return (
  <Dialog>
   <DialogTrigger render={
    <Button size="lg" onClick={onShare} className={'outline outline-accent-foreground'}>
     <LockIcon data-icon="inline-end" />
     Share
    </Button>} />
   <DialogContent className="sm:max-w-md">
    <DialogHeader>
     <DialogTitle>Share with others</DialogTitle>
     <DialogDescription>
      Add people by email or @mention workspace members.
     </DialogDescription>
    </DialogHeader>
    <div className="flex items-center gap-2">
     <div className="grid flex-1 gap-2">
      <Label htmlFor="email" className="sr-only">
       Add people
      </Label>
      <Input
       id="email"
       placeholder="Add people by email..."
      />
     </div>


     <Select items={roles} defaultValue={roles[1]!.value}>
      <SelectTrigger className="w-max">
       <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
       <SelectGroup>
        {roles.map((role) => (
         <SelectItem key={role.value} value={role.value}>
          {role.label}
         </SelectItem>
        ))}
       </SelectGroup>
      </SelectContent>
     </Select>
    </div>

    {/* No collaborators found */}
    <Empty className="border border-dashed">
     <EmptyHeader>
      <EmptyMedia variant="icon">
       <UserRoundPlus />
      </EmptyMedia>
      <EmptyTitle>No collaborators found</EmptyTitle>
      <EmptyDescription>Click the button below to add a a collaborator to this document.</EmptyDescription>
     </EmptyHeader>
     <EmptyContent>
      <Button>Add collaborator</Button>
     </EmptyContent>
    </Empty>


    {/* Collaborators or invitees exist */}
    <Tabs defaultValue="people-with-access" className="w-full">
     <TabsList className={'w-full'} variant={'line'}>
      <TabsTrigger className={"uppercase text-xs font-semibold"} value="people-with-access">People with access</TabsTrigger>
      <TabsTrigger className={"uppercase text-xs font-semibold"} value="invite-list">Invite list</TabsTrigger>
     </TabsList>
     <TabsContent value="people-with-access">
      <Item className="pr-0">
       <ItemMedia variant="icon">
        <User />
       </ItemMedia>
       <ItemContent>
        <ItemTitle>Test User</ItemTitle>
        <ItemDescription>testuser@gmail.com</ItemDescription>
       </ItemContent>
       <ItemActions >
        <Select items={roles} defaultValue={roles[1]!.value}>
         <SelectTrigger className="w-max">
          <SelectValue placeholder="Theme" />
         </SelectTrigger>
         <SelectContent>
          <SelectGroup>
           {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
             {role.label}
            </SelectItem>
           ))}
          </SelectGroup>
         </SelectContent>
        </Select>
       </ItemActions>
      </Item>
     </TabsContent>
     <TabsContent value="invite-list">
      <Item className="pr-0">
       <ItemMedia variant="icon">
        <User />
       </ItemMedia>
       <ItemContent>
        <ItemTitle>Test User</ItemTitle>
        <ItemDescription>testuser@gmail.com</ItemDescription>
       </ItemContent>
       <ItemActions >
        <Select items={roles} defaultValue={roles[1]!.value}>
         <SelectTrigger className="w-max">
          <SelectValue placeholder="Theme" />
         </SelectTrigger>
         <SelectContent>
          <SelectGroup>
           {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
             {role.label}
            </SelectItem>
           ))}
          </SelectGroup>
         </SelectContent>
        </Select>
       </ItemActions>
      </Item>
     </TabsContent>
    </Tabs>
    <div className={"uppercase text-xs font-semibold"}>general access</div>
    <div className="flex justify-between -mt-3 items-center">
     <div>Anyone with link</div>
     <Select items={roles} defaultValue={roles[1]!.value}>
      <SelectTrigger className="w-max">
       <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
       <SelectGroup>
        {roles.map((role) => (
         <SelectItem key={role.value} value={role.value}>
          {role.label}
         </SelectItem>
        ))}
       </SelectGroup>
      </SelectContent>
     </Select>
    </div>
    <DialogFooter className="flex sm:justify-between w-full">
     <Button variant={'outline'} onClick={() => handleCopy(window.location.href)}>
      {copied ? <Check data-icon="inline-end" /> : <Link data-icon="inline-end" />} Copy link</Button>
     <Button><Mail data-icon="inline-end" /> Send invitation</Button>
    </DialogFooter>
   </DialogContent>
  </Dialog >
 )
}