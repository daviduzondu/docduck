import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Edit3, RotateCcw, X } from 'lucide-react';
import { EditorShareDialogButton } from './editor-share-dialog';
import { useSidebar } from '../ui/sidebar';
import { HocuspocusProvider, onAwarenessUpdateParameters } from '@hocuspocus/provider';
import { generateAnonymousAvatar, sendStateless } from '@/lib/utils';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { useDocument } from '@/providers/document.provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import {
 Field,
 FieldError,
 FieldLabel,
} from "@/components/ui/field"
import z, { uuidv7 } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { $api, orpc } from '@/lib/orpc.client';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { AwarenessStates } from '@/types';
import { useShallow } from 'zustand/react/shallow';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isDefinedError } from '@orpc/client';

interface EditorHeaderProps {
 onEdit?: () => void;
 onShare?: () => void;
 canEdit: boolean
}



export const EditorHeader: React.FC<EditorHeaderProps> = ({
 canEdit,
 onEdit,
 onShare,
}) => {
 const queryClient = useQueryClient();

 const [collaborators, setCollaborators] = useState<AwarenessStates[]>([]);
 const { open } = useSidebar();
 const { mode, documentId, snapshotId, title, provider, setMode } = useDocument(
  useShallow(state => ({
   mode: state.mode,
   documentId: state.documentId,
   snapshotId: state.snapshotId,
   title: state.title,
   provider: state.provider,
   setMode: state.setMode
  }))
 );
 const { mutate: restore, isPending } = useMutation(
  orpc.documents.restoreSnapshotbyId.mutationOptions({
   onSuccess: () => {
    queryClient.invalidateQueries({
     queryKey: orpc.documents.getSnapshots.infiniteKey({
      input: (pageParam) => ({
       params: { documentId },
       query: { page: pageParam },
      }),
      initialPageParam: 1,
     }),
    });
    setMode('editor');
    sendStateless(provider, { type: 'notify', data: "Document reverted to older version" })
   },
  })
 );

 useEffect(() => {
  const handleAwarenessUpdate = ({ states }: onAwarenessUpdateParameters) => {
   setCollaborators(states.map(x => ({ ...x.user })));
  };

  provider.on('awarenessUpdate', handleAwarenessUpdate);

  return () => {
   provider.off('awarenessUpdate', handleAwarenessUpdate);
  };
 }, [provider]);

 return (
  <header className="flex w-full items-center px-3 py-2 justify-between">
   {mode === 'editor' ? <div className="text-2xl font-bold grow basis-0">DocDuck</div> :
    <div className={'grow'}>
     <Button variant={'secondary'} className={'cursor-pointer'} onClick={() => setMode('editor')}><X /> Return to editor</Button>
    </div>
   }

   {mode === 'editor' ?
    canEdit ?
     <EditTitlePopover title={title} documentId={documentId} provider={provider}>
      <div className={`text-center space-x-2 inline-flex items-center justify-center  ${open ? 'mr-[24rem]' : ''}`}>
       <div className={`truncate text-center`}>{title}</div>
       <Edit3 className={"size-3.5"} />
      </div>
     </EditTitlePopover>
     : <div className={`text-center space-x-2 inline-flex items-center justify-center  ${open ? 'mr-[24rem]' : ''}`}>
      <div className={`truncate text-center`}>{title}</div>
     </div> :
    <div className={`${open ? 'mr-[24rem]' : ''} bg-red- w-full text-center`}>
     {/* <Button >Restore this version</Button> */}

     <Button
      size="lg"
      disabled={isPending}
      onClick={() => {
       restore({ params: { documentId, snapshotId } })
      }}
     >
      <RotateCcw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Restoring..." : "Restore this version"}
     </Button>
    </div>
   }
   <div className="gap-2 items-center flex grow basis-0 justify-end">
    {collaborators.length > 0 && collaborators.every(collaborator => collaborator.id !== undefined) ? <CollaboratorsHoverCard collaborators={collaborators} /> : null}
    <EditorShareDialogButton onShare={onShare} />
   </div>
  </header>
 );
};

function EditTitlePopover({ children, title, documentId, provider }: { children: React.ReactNode, title: string, documentId: string, provider: HocuspocusProvider }) {
 const { open } = useSidebar();
 const updateTitleSchema = z.object({
  title: z.string().trim().nonempty({ error: "Title cannot be empty" }),
 });
 const form = useForm<z.infer<typeof updateTitleSchema>>({
  resolver: zodResolver(updateTitleSchema),
  shouldUnregister: true,
  defaultValues: {
   title
  }
 });

 async function onSubmit({ title }: { title: string }) {
  try {
   sendStateless(provider, {
    data: title,
    type: 'update:title'
   });
   await $api.documents.updateDocumentTitle({
    body: { title },
    params: { id: documentId }
   });
  } catch (e) {
   console.error(e);
   return
  }
 }


 return <Popover>
  <PopoverTrigger className={"active:not-aria-[haspopup]:translate-y-px cursor-pointer p-0"}>
   {children}
  </PopoverTrigger>
  <PopoverContent side="bottom" align="center" className={`w-lg ${open ? 'mr-[24rem]' : ''}`}>
   <form id='update-title-form' onSubmit={form.handleSubmit(onSubmit)}>
    <Controller
     name="title"
     control={form.control}
     render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
       <FieldLabel htmlFor='title'>
        Update Title
       </FieldLabel>
       <div className='flex space-x-2 w-full'>
        <div className='flex-1 space-y-2'>
         <Input
          {...field}
          id="title"
          placeholder='Update title...'
         />
         {fieldState.invalid && (
          <FieldError errors={[fieldState.error]} />
         )}
        </div>
        <Button className={'w-fit'} type='submit' form='update-title-form'>Update</Button>
       </div>
      </Field>
     )}
    />
   </form>
  </PopoverContent>
 </Popover>
}

function CollaboratorAvatar({ collaborator }: { collaborator: AwarenessStates }) {
 return <Avatar>
  <AvatarImage src={
   collaborator.name
    ? collaborator.isAnonymous
     ? generateAnonymousAvatar(collaborator.name).toDataUri()
     : collaborator.image
    : undefined
  } alt={collaborator.name} />
  <AvatarFallback style={{ background: collaborator.color }} className={'text-background text-base'}>{
   collaborator.name?.split(" ")[0]![0]}</AvatarFallback>
 </Avatar>
}

function CollaboratorsHoverCard({ collaborators }: { collaborators: AwarenessStates[] }) {
 const randomId = useRef(uuidv4());
 return (
  <HoverCard>
   <HoverCardTrigger delay={150}>
    <AvatarGroup className="bg-card-foreground px-1 py-1 rounded-full w-fit">
     {collaborators.map((collaborator) => (
      <CollaboratorAvatar key={collaborator.id + randomId} collaborator={collaborator} />
     ))}
    </AvatarGroup>
   </HoverCardTrigger>
   <HoverCardContent side="bottom" align="center">
    <div className='uppercase text-xs font-semibold pb-2'>in this document</div>
    {collaborators.map((collaborator) => <Item key={collaborator.id + randomId} className='p-0 not-last:pb-3'>
     <ItemMedia variant="icon">
      <CollaboratorAvatar collaborator={collaborator} />
     </ItemMedia>
     <ItemContent>
      <ItemTitle>{collaborator.name}</ItemTitle>
      <Badge>{collaborator.role}</Badge>
     </ItemContent>
    </Item>)}
   </HoverCardContent>
  </HoverCard>
 );
}