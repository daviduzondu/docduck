import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Edit3 } from 'lucide-react';
import { EditorShareDialogButton } from './editor-share-dialog';
import { useSidebar } from '../ui/sidebar';
import { HocuspocusProvider, onAwarenessUpdateParameters } from '@hocuspocus/provider';
import { generateAnonymousAvatar } from '@/lib/utils';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';

interface EditorHeaderProps {
 title?: string;
 provider: HocuspocusProvider;
 onEdit?: () => void;
 onShare?: () => void;
 canEdit: boolean
}

type AwarenessStates = {
 name: string, color: string, image?: string, isAnonymous: boolean
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
 title,
 provider,
 canEdit,
 onEdit,
 onShare,
}) => {
 const [collaborators, setCollaborators] = useState<AwarenessStates[]>([]);

 const { open } = useSidebar();

 useEffect(() => {
  provider.on('awarenessUpdate', ({ states }: onAwarenessUpdateParameters) => {
   setCollaborators(states.map(x => ({ ...x.user })))
  })
 }, []);

 if (collaborators.length >= 1)
  return (
   <header className="flex w-full items-center px-3 py-2 justify-between sticky top-0">
    <div className="text-2xl font-bold grow basis-0">DocDuck</div>

    <div className={`text-center space-x-1  ${open ? 'mr-[20em]' : ''}`}>
     <div className={`truncate text-center inline`}>{title}</div>
     <Button size="icon-xs" variant="ghost" onClick={onEdit}>
      {canEdit ? <Edit3 /> : null}
     </Button>
     {/* <Badge className="uppercase text-xs inline rounded-sm" variant="default">private</Badge> */}
    </div>

    <div className="gap-2 items-center flex grow basis-0 justify-end">
     <CollaboratorsHoverCard collaborators={collaborators} />
     <EditorShareDialogButton onShare={onShare} />
    </div>
   </header>
  );
};

function CollaboratorAvatar({ collaborator }: { collaborator: AwarenessStates }) {
 return <Avatar key={collaborator.name}>
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
 return (
  <HoverCard>
   <HoverCardTrigger delay={150}>
    <AvatarGroup className='bg-card-foreground px-1 py-1 rounded-full w-fit'>
     {collaborators.map((collaborator) => <CollaboratorAvatar collaborator={collaborator} />)}
    </AvatarGroup>
   </HoverCardTrigger>
   <HoverCardContent side="bottom" align="center">
    <div className='uppercase text-xs font-semibold pb-2'>in this document</div>
    {collaborators.map((collaborator) => <Item className='p-0 not-last:pb-3'>
     <ItemMedia variant="icon">
      <CollaboratorAvatar collaborator={collaborator} />
     </ItemMedia>
     <ItemContent>
      <ItemTitle>{collaborator.name}</ItemTitle>
     </ItemContent>
    </Item>)}
   </HoverCardContent>
  </HoverCard>
 );
}