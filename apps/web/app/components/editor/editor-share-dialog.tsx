import { Button } from '@/components/ui/button'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
 ArrowRightIcon,
 Check,
 GlobeIcon,
 Link,
 Loader,
 LockIcon,
 Mail,
 MailPlus,
 UserRoundPlus,
 X,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
 Select,
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectTrigger,
} from '@/components/ui/select'
import {
 Empty,
 EmptyDescription,
 EmptyHeader,
 EmptyMedia,
 EmptyTitle,
} from '@/components/ui/empty'
import {
 Item,
 ItemActions,
 ItemContent,
 ItemDescription,
 ItemMedia,
 ItemTitle,
} from '@/components/ui/item'
import { useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import {
 InputGroup,
 InputGroupInput,
 InputGroupAddon,
} from '@/components/ui/input-group'
import validator from 'validator'
import { orpc } from '@/lib/orpc.client'
import { useDocument } from '@/providers/document.provider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getUserColor, sendStateless } from '@/lib/utils'
import { useAuth } from '@/providers/auth.provider'
import { AwarenessStates } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import { Switch } from '@/components/ui/switch'
import { router } from 'better-auth/api'
import { usePathname, useRouter } from 'next/navigation'

const shareFormSchema = z.object({
 invitees: z
  .array(
   z.object({
    email: z.email(),
    role: z.enum(['EDITOR', 'VIEWER']),
   })
  )
  .min(1),
})

const roles = [
 { label: 'Editor', value: 'EDITOR' },
 { label: 'Viewer', value: 'VIEWER' },
]

export function EditorShareDialogButton({
 onShare,
 isPrivate,
}: {
 onShare: any
 isPrivate: boolean
}) {
 const queryClient = useQueryClient()
 const { data: authData } = useAuth()
 const [privateDocument, setPrivateDocument] = useState(isPrivate)
 const [copied, setCopied] = useState(false)
 const [newEmail, setNewEmail] = useState('')
 const [newRole, setNewRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER')
 const [emailError, setEmailError] = useState('')
 const [tabValue, setTabValue] = useState<
  'people-with-access' | 'invite-list' | 'yet-to-respond'
 >('people-with-access')
 const { documentId, provider } = useDocument()
 const { data } = useAuth()
 const router = useRouter()
 const pathname = usePathname()

 const getCollaboratorsQuery = useQuery(
  orpc.documents.getCollaborators.queryOptions({
   input: {
    params: {
     id: documentId,
    },
   },
   enabled:
    Array.from(provider.awareness?.states.values() ?? [])
     .map<AwarenessStates>((x) => x.user)
     .filter((x) => x?.id === data?.user.id)[0]?.role === 'OWNER',
  })
 )

 const getPendingInvitationsQuery = useQuery(
  orpc.documents.getPendingInvitations.queryOptions({
   input: {
    params: {
     id: documentId,
    },
   },
   enabled: tabValue === 'yet-to-respond',
  })
 )

 const updateDocumentVisibilityMutation = useMutation(
  orpc.documents.setDocumentVisibility.mutationOptions({
   onError(error) {
    toast.error(error.message)
   },
   onSuccess() {
    setPrivateDocument(!privateDocument)
   },
  })
 )

 const updateUserRoleMutation = useMutation(
  orpc.documents.updateUserRole.mutationOptions({
   onError(error) {
    toast.error(error.message)
   },
   onSuccess(data) {
    sendStateless(provider, {
     type: 'role:update',
     data: {
      userId: data.data.userId,
      newRole: data.data.role,
     },
    })
    queryClient.invalidateQueries({
     predicate(query) {
      return query.queryHash.includes('getCollaborators')
     },
    })
   },
  })
 )

 const sendInvitationsMutation = useMutation(
  orpc.documents.createDocumentInvitations.mutationOptions({
   onError(error) {
    toast.error(error.message)
   },
   onSuccess() {
    queryClient.invalidateQueries({
     predicate(query) {
      return query.queryHash.includes('getCollaborators')
     },
    })
    queryClient.invalidateQueries({
     predicate(query) {
      return query.queryHash.includes('getPendingInvitations')
     },
    })
   },
  })
 )

 const handleCopy = async (textToCopy: string) => {
  try {
   await navigator.clipboard.writeText(textToCopy)
   setCopied(true)
   setTimeout(() => setCopied(false), 2000)
  } catch (err) {
   console.error('Failed to copy: ', err)
  }
 }

 const form = useForm<z.infer<typeof shareFormSchema>>({
  resolver: zodResolver(shareFormSchema),
 })

 const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'invitees',
 })

 function addInvite() {
  const isDuplicate = fields.some((f) => {
   const normalizedEmail = validator.normalizeEmail(newEmail.toLowerCase())
   return f.email.toLowerCase() === normalizedEmail
  })
  const result = z.email().safeParse(newEmail)
  if (!result.success) {
   setEmailError('Please enter a valid email address.')
   return
  }
  if (isDuplicate) {
   setEmailError('This email has already been added.')
   return
  }
  setEmailError('')
  append({ email: newEmail, role: newRole })
  setNewEmail('')
  setNewRole('VIEWER')
  setTabValue('invite-list')
 }

 async function onSubmit(data: z.infer<typeof shareFormSchema>) {
  await sendInvitationsMutation.mutateAsync({
   body: { invitees: data.invitees },
   params: { id: documentId },
  })
  remove()
 }

 return (
  <Dialog>
   <DialogTrigger
    render={
     !authData?.user.id ? (
      <Button
       onClick={() => {
        sessionStorage.setItem('redirectAfterAuth', pathname)
        router.push('/auth/login')
       }}
      >
       <ArrowRightIcon data-icon="inline-end" />
       Login
      </Button>
     ) : (
      <Button
       size="lg"
       disabled={!getCollaboratorsQuery.isEnabled}
       onClick={onShare}
       className={'outline outline-accent-foreground'}
      >
       {privateDocument ? (
        <LockIcon data-icon="inline-end" />
       ) : (
        <GlobeIcon data-icon="inline-end" />
       )}
       Share
      </Button>
     )
    }
   />
   <DialogContent className="w-[680px] max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader>
     <DialogTitle>Share with others</DialogTitle>
     <DialogDescription>Add people by email</DialogDescription>
    </DialogHeader>
    <form
     id="share-form"
     onSubmit={form.handleSubmit(onSubmit)}
     className="space-y-4"
    >
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
          setNewEmail(e.target.value)
          if (emailError) setEmailError('')
         }}
         onKeyDown={(e) => {
          if (e.key === 'Enter') {
           e.preventDefault()
           addInvite()
          }
         }}
         type="email"
        />
        <InputGroupAddon align="inline-end" className="pr-1.5 gap-0">
         <Select
          value={newRole}
          onValueChange={(v) => setNewRole(v as 'EDITOR' | 'VIEWER')}
         >
          <SelectTrigger className="w-max bg-transparent">
           {[...roles].filter((x) => x.value === newRole)[0]!.label}
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
         <Button
          type="button"
          size={'sm'}
          variant={'outline'}
          onClick={addInvite}
         >
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
       <TabsTrigger
        className={'uppercase text-xs font-semibold'}
        value="people-with-access"
        onClick={() => setTabValue('people-with-access')}
       >
        People with access
       </TabsTrigger>
       <TabsTrigger
        className={'uppercase text-xs font-semibold'}
        value="invite-list"
        onClick={() => setTabValue('invite-list')}
       >
        Invite list
       </TabsTrigger>
       <TabsTrigger
        className={'uppercase text-xs font-semibold'}
        value="yet-to-respond"
        onClick={() => setTabValue('yet-to-respond')}
       >
        Yet to respond
       </TabsTrigger>
      </TabsList>

      <TabsContent
       value="people-with-access"
       className={'min-h-72 max-h-72 overflow-y-auto'}
      >
       {getCollaboratorsQuery.isLoading ? (
        <TabSkeleton />
       ) : getCollaboratorsQuery.data &&
         getCollaboratorsQuery.data.length > 0 ? (
        <>
         {(() => {
          const owner = getCollaboratorsQuery.data.find(
           (x) => x.role === 'OWNER'
          )
          const rest = getCollaboratorsQuery.data.filter(
           (x) => x.role !== 'OWNER'
          )
          const sorted = owner ? [owner, ...rest] : rest

          return sorted.map((collab) => (
           <Item
            key={collab.id}
            className="px-3 py-1 hover:bg-accent mb-1 flex items-center justify-center"
           >
            <ItemMedia variant="icon">
             <Avatar key={collab.id}>
              <AvatarImage
               src={collab.image || undefined}
               alt={`Profile picture of ${collab.name}`}
              />
              <AvatarFallback
               style={{ background: getUserColor(collab.id) }}
               className={'text-background text-base'}
              >
               {collab.name?.split(' ')[0]![0]}
              </AvatarFallback>
             </Avatar>
            </ItemMedia>
            <ItemContent>
             <ItemTitle>{collab.name}</ItemTitle>
             <ItemDescription>{collab.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
             {collab.role === 'OWNER' ? (
              <span className="text-sm text-muted-foreground">You</span>
             ) : (
              <Select
               value={collab.role}
               disabled={updateUserRoleMutation.isPending}
               onValueChange={(value) => {
                updateUserRoleMutation.mutate({
                 params: { id: documentId },
                 body: {
                  role: value as 'EDITOR' | 'VIEWER',
                  userId: collab.id,
                 },
                })
               }}
              >
               <SelectTrigger className="w-max bg-transparent">
                {roles.find((r) => r.value === collab.role)?.label ??
                 collab.role}
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
            </ItemActions>
           </Item>
          ))
         })()}
        </>
       ) : (
        <NothingToSeeHere
         icon={<UserRoundPlus />}
         title="No one with access...yet"
         description="Collaborators will appear here once they accept your invite."
        />
       )}
      </TabsContent>

      <TabsContent
       value="invite-list"
       className={'min-h-72 max-h-72 overflow-y-auto'}
      >
       {fields.length === 0 && (
        <NothingToSeeHere
         icon={<MailPlus />}
         title="No invitees...yet"
         description="Add people to review before sending invitations"
        />
       )}
       {fields.map((fieldItem, index) => (
        <Item
         key={fieldItem.id}
         className="px-3 py-1 hover:bg-accent mb-1 flex items-center justify-center"
        >
         <ItemContent>{fieldItem.email}</ItemContent>
         <ItemActions>
          <Controller
           name={`invitees.${index}.role`}
           control={form.control}
           render={({ field }) => (
            <Select
             name={field.name}
             value={field.value}
             onValueChange={field.onChange}
            >
             <SelectTrigger className="w-max bg-transparent">
              {[...roles].filter((x) => x.value === field.value)[0]!.label}
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
          <Button
           variant="ghost"
           size="icon-xs"
           onClick={() => remove(index)}
           aria-label={`Remove email ${index + 1}`}
          >
           <X />
          </Button>
         </ItemActions>
        </Item>
       ))}
      </TabsContent>

      <TabsContent
       value="yet-to-respond"
       className={'min-h-72 max-h-72 overflow-y-auto'}
      >
       {(() => {
        if (getPendingInvitationsQuery.error)
         return <div>Failed to get pending invitations</div>
        if (getPendingInvitationsQuery.isLoading) return <TabSkeleton />
        if (getPendingInvitationsQuery.data?.data.length === 0)
         return (
          <NothingToSeeHere
           icon={<MailPlus />}
           title="No pending invitations"
           description="After you send out an invite, anyone who's not responded will appear here"
          />
         )
        if (
         getPendingInvitationsQuery.data &&
         getPendingInvitationsQuery.data.data.length > 0
        )
         return getPendingInvitationsQuery.data.data.map((invitation) => (
          <Item
           key={invitation.id}
           className="px-3 py-1 hover:bg-accent mb-1 flex items-center justify-center group"
          >
           <ItemContent>
            <ItemTitle>{invitation.email}</ItemTitle>
            <ItemDescription className="text-amber-600/80">
             {invitation.emailStatus === 'FAILED' &&
              'There was a problem delivering the invite email'}
            </ItemDescription>
           </ItemContent>
           <ItemActions className="invisible group-hover:visible transition-none">
            <Button
             variant={'outline'}
             size="sm"
             onClick={async () => {
              await sendInvitationsMutation.mutateAsync({
               body: {
                invitees: [
                 {
                  email: invitation.email,
                  role: invitation.role as any,
                 },
                ],
               },
               params: { id: documentId },
              })
             }}
            >
             Resend
            </Button>
           </ItemActions>
          </Item>
         ))
        return <div>Something went wrong.</div>
       })()}
      </TabsContent>
     </Tabs>

     <div className={cn('flex flex-col w-full')}>
      <div
       className="text-left py-2 mb-4 mt-2 flex items-center gap-2 justify-between border -mx-2 px-4 hover:cursor-pointer hover:bg-accent rounded-full"
       onClick={() => {
        updateDocumentVisibilityMutation.mutate({
         params: { id: documentId },
         body: { visibility: privateDocument ? 'PUBLIC' : 'PRIVATE' },
        })
       }}
      >
       <Label htmlFor="visibility" className="pointer-events-none">
        Anyone with link can view
       </Label>
       <div className="flex">
        <Loader
         className={`animate-spin ${updateDocumentVisibilityMutation.isPending ? 'visible' : 'invisible'}`}
        />
        <Switch
         checked={!privateDocument}
         name="visibility"
         className={`pointer-events-none ${updateDocumentVisibilityMutation.isPending ? 'hidden' : ''}`}
        />
       </div>
      </div>
      <div className="flex justify-between">
       <Button
        variant={'outline'}
        onClick={() => handleCopy(window.location.href)}
       >
        {copied ? (
         <Check data-icon="inline-end" />
        ) : (
         <Link data-icon="inline-end" />
        )}{' '}
        Copy link
       </Button>
       <Button
        type="submit"
        className={`${tabValue === 'invite-list' ? 'visible' : 'invisible'}`}
        disabled={form.formState.isSubmitting || !form.formState.isValid}
       >
        <Mail data-icon="inline-end" />{' '}
        {form.formState.isSubmitting ? 'Sending...' : 'Send invitation'}
       </Button>
      </div>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}

function NothingToSeeHere({
 title,
 description,
 icon,
}: {
 title: string
 description: string
 icon: React.ReactNode
}) {
 return (
  <Empty className="border border-dashed h-72">
   <EmptyHeader>
    <EmptyMedia variant="icon">{icon}</EmptyMedia>
    <EmptyTitle className="text-lg">{title}</EmptyTitle>
    <EmptyDescription>{description}</EmptyDescription>
   </EmptyHeader>
  </Empty>
 )
}

function TabSkeleton() {
 return (
  <div className="h-72 overflow-hidden">
   {Array.from({ length: 10 }).map((_, i) => (
    <Skeleton key={i} className="h-10 not-last:mb-2 w-full" />
   ))}
  </div>
 )
}
