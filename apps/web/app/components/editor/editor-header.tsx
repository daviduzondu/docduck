import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit3 } from 'lucide-react';
import { EditorShareDialogButton } from './editor-share-dialog';
import { useSidebar } from '../ui/sidebar';
import { HocuspocusProvider, onAwarenessUpdateParameters } from '@hocuspocus/provider';
import { generateAnonymousAvatar } from '@/lib/utils';

interface EditorHeaderProps {
 title?: string;
 provider: HocuspocusProvider;
 onEdit?: () => void;
 onShare?: () => void;
}

type AwarenessStates = {
 name: string, color: string, image?: string, isAnonymous: boolean
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
 title = 'The principle of population, as it affects the future improvement of society',
 provider,
 onEdit,
 onShare,
}) => {
 const [collaborators, setCollaborators] = useState<AwarenessStates[]>([]);

 const { open } = useSidebar();

 useEffect(() => {
  provider.on('awarenessUpdate', ({ states }: onAwarenessUpdateParameters) => {
   console.log(states)
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
      <Edit3 />
     </Button>
     {/* <Badge className="uppercase text-xs inline rounded-sm" variant="default">private</Badge> */}
    </div>

    <div className="gap-2 items-center flex grow basis-0 justify-end">
     <AvatarGroup className='bg-card-foreground px-1 py-1 rounded-full w-fit'>
      {collaborators.map((collaborator) => (
       <Avatar key={collaborator.name}>
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
      ))}
     </AvatarGroup>
     <EditorShareDialogButton onShare={onShare} />
    </div>
   </header>
  );
};