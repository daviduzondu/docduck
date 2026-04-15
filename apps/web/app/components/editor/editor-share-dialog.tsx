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
import { Label } from "@/components/ui/label"
import { Check, Link, LockIcon, Mail, MailPlus, UserRoundPlus, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
 Select,
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectTrigger,
} from "@/components/ui/select";
import {
 Empty,
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
 ItemHeader,
 ItemMedia,
 ItemTitle,
} from "@/components/ui/item"
import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import {
 InputGroup,
 InputGroupInput,
 InputGroupAddon,
} from "@/components/ui/input-group"
import validator from 'validator';
import { orpc } from "@/lib/orpc.client"
import { useDocument } from "@/providers/document.provider"
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserColor } from "@/lib/utils"
import { useAuth } from "@/providers/auth.provider"
import { AwarenessStates } from "@/types"

const shareFormSchema = z.object({
 invitees: z.array(z.object({
  email: z.email(),
  role: z.enum(["EDITOR", "VIEWER"])
 })).min(1)
});

const roles = [{ label: "Editor", value: "EDITOR" }, { label: "Viewer", value: "VIEWER" }];
export function EditorShareDialogButton({ onShare }: { onShare: any }) {
 const [copied, setCopied] = useState(false);
 const [newEmail, setNewEmail] = useState("");
 const [newRole, setNewRole] = useState<'EDITOR' | 'VIEWER'>("VIEWER");
 const [emailError, setEmailError] = useState("");
 const [tabValue, setTabValue] = useState<"people-with-access" | "invite-list">('people-with-access');
 const { documentId, provider } = useDocument();
 const { data } = useAuth();
 const getCollaboratorsQuery = useQuery(orpc.documents.getCollaborators.queryOptions({
  input: {
   params: {
    id: documentId
   }
  },
  enabled: Array.from((provider.awareness?.states.values()) ?? []).map<AwarenessStates>(x => (x.user)).filter(x => x?.id === data?.user.id)[0]?.role === 'OWNER'
 }));

 const sendInvitationsMutation = useMutation(orpc.documents.createDocumentInvitations.mutationOptions({
  onError(error) {
   toast.error(error.message);
  },
 }));

 const handleCopy = async (textToCopy: string) => {
  try {
   await navigator.clipboard.writeText(textToCopy);
   setCopied(true);
   setTimeout(() => setCopied(false), 2000);
  } catch (err) {
   console.error('Failed to copy: ', err);
  }
 }

 const form = useForm<z.infer<typeof shareFormSchema>>({
  resolver: zodResolver(shareFormSchema),
 })

 const { fields, append, remove } = useFieldArray({ control: form.control, name: "invitees" })

 function addInvite() {
  const isDuplicate = fields.some((f) => {
   const normalizedEmail = validator.normalizeEmail(newEmail.toLowerCase());
   return f.email.toLowerCase() === normalizedEmail;
  });
  const result = z.email().safeParse(newEmail);
  if (!result.success) {
   setEmailError("Please enter a valid email address.");
   return;
  }
  if (isDuplicate) {
   setEmailError("This email has already been added.");
   return;
  }
  setEmailError("");
  append({ email: newEmail, role: newRole });
  setNewEmail("");
  setNewRole('VIEWER');
  setTabValue('invite-list')
 }

 async function onSubmit(data: z.infer<typeof shareFormSchema>) {
  await sendInvitationsMutation.mutateAsync({
   body: { invitees: data.invitees },
   params: { id: documentId }
  })
 }

 return (
  <Dialog>
   <DialogTrigger
    disabled={!getCollaboratorsQuery.isEnabled}
    render={
     <Button size="lg" onClick={onShare} className={'outline outline-accent-foreground'}>
      <LockIcon data-icon="inline-end" />
      Share
     </Button>} />
   <DialogContent className="sm:max-w-md">
    <DialogHeader>
     <DialogTitle>Share with others</DialogTitle>
     <DialogDescription>
      Add people by email
     </DialogDescription>
    </DialogHeader>
    <form id="share-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
     <div className="flex items-center gap-2">
      <div className="grid flex-1 gap-2">
       <Label htmlFor="inviteEmail" className="sr-only">
        Add people
       </Label>
       <InputGroup>
        <InputGroupInput
         id="inviteEmail"
         placeholder="Add people by email..."
         value={newEmail}
         onChange={(e) => {
          setNewEmail(e.target.value);
          if (emailError) setEmailError("");
         }}
         onKeyDown={(e) => {
          if (e.key === "Enter") {
           e.preventDefault();
           addInvite();
          }
         }}
         type="email"
        />
        <InputGroupAddon align="inline-end" className="pr-1.5 gap-0">
         <Select value={newRole} onValueChange={(v) => setNewRole((v as "EDITOR" | 'VIEWER'))}>
          <SelectTrigger className="w-max bg-transparent">
           {[...roles].filter(x => x.value === newRole)[0]!.label}
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
         <Button type="button" size={'sm'} variant={'outline'} onClick={addInvite}>
          Add
         </Button>
        </InputGroupAddon>
       </InputGroup>
       {emailError && (
        <p className="text-sm text-destructive mt-1">{emailError}</p>
       )}
      </div>
     </div>

     <Tabs value={tabValue} className="w-full">
      <TabsList className={'w-full'} variant={'line'}>
       <TabsTrigger className={"uppercase text-xs font-semibold"} value="people-with-access" onClick={() => setTabValue('people-with-access')}>People with access</TabsTrigger>
       <TabsTrigger className={"uppercase text-xs font-semibold"} value="invite-list" onClick={() => setTabValue('invite-list')}>invite list</TabsTrigger>
      </TabsList>
      <TabsContent value="people-with-access" className={'min-h-60 max-h-60'}>
       {getCollaboratorsQuery.isLoading ? (
        <div className="p-4">Loading collaborators...</div>
       ) : (getCollaboratorsQuery.data && getCollaboratorsQuery.data.length > 0) ? (
        <>
         {(() => {
          const owner = getCollaboratorsQuery.data.find(x => x.role === "OWNER");
          const rest = getCollaboratorsQuery.data.filter(x => x.role !== "OWNER");
          const sorted = owner ? [owner, ...rest] : rest;

          return sorted.map((collab) => (
           <Item key={collab.id} className="px-3 py-1 hover:bg-accent mb-1 flex items-center justify-center">
            <ItemMedia variant="icon">
             <Avatar key={collab.id}>
              <AvatarImage src={collab.image || undefined} alt={`Profile picture of ${collab.name}`} />
              <AvatarFallback style={{ background: getUserColor(collab.id) }} className={'text-background text-base'}>
               {collab.name?.split(" ")[0]![0]}
              </AvatarFallback>
             </Avatar>
            </ItemMedia>
            <ItemContent>
             <ItemTitle>{collab.name}</ItemTitle>
             <ItemDescription>{collab.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
             <span className="text-sm text-muted-foreground">
              {collab.role === 'EDITOR' ? 'Editor' : collab.role === 'OWNER' ? 'Owner' : 'Viewer'}
             </span>
            </ItemActions>
           </Item>
          ));
         })()}
        </>
       ) : (
        <NothingToSeeHere icon={<UserRoundPlus />} title="No one with access...yet" description="Collaborators will appear here once they accept your invite." />
       )}
      </TabsContent>
      <TabsContent value="invite-list" className={'min-h-60 max-h-60'}>
       {fields.length === 0 && (
        <NothingToSeeHere icon={<MailPlus />} title="No invitees...yet" description="Add people to review before sending invitations" />
       )}
       {fields.map((fieldItem, index) => (
        <Item key={fieldItem.id} className="px-3 py-1 hover:bg-accent mb-1 flex items-center justify-center">
         <ItemContent>
          {fieldItem.email}
         </ItemContent>
         <ItemActions>
          <Controller
           name={`invitees.${index}.role`}
           control={form.control}
           render={({ field }) => (
            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
             <SelectTrigger className="w-max bg-transparent">
              {[...roles].filter(x => x.value === field.value)[0]!.label}
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
           )}
          />
          <Button variant="ghost" size="icon-xs" onClick={() => remove(index)} aria-label={`Remove email ${index + 1}`}>
           <X />
          </Button>
         </ItemActions>
        </Item>
       ))}
      </TabsContent>
     </Tabs>

     <DialogFooter className="flex sm:justify-between w-full">
      <Button variant={'outline'} onClick={() => handleCopy(window.location.href)}>
       {copied ? <Check data-icon="inline-end" /> : <Link data-icon="inline-end" />} Copy link
      </Button>
      <Button type="submit" className={`${tabValue === "invite-list" ? "visible" : "invisible"}`} disabled={form.formState.isSubmitting || !form.formState.isValid}><Mail data-icon="inline-end" /> {form.formState.isSubmitting ? "Sending..." : "Send invitation"}</Button>
     </DialogFooter>
    </form>
   </DialogContent>
  </Dialog>
 )
}

function NothingToSeeHere({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
 return <Empty className="border border-dashed h-60">
  <EmptyHeader>
   <EmptyMedia variant="icon">
    {icon}
   </EmptyMedia>
   <EmptyTitle className="text-lg">{title}</EmptyTitle>
   <EmptyDescription>{description}</EmptyDescription>
  </EmptyHeader>
 </Empty>
}