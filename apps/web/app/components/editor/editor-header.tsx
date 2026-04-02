import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit3 } from 'lucide-react';
import { EditorShareDialogButton } from './editor-share-dialog';
import { useSidebar } from '../ui/sidebar';

interface AvatarData {
 src: string;
 alt: string;
 fallback: string;
}

interface EditorHeaderProps {
 title?: string;
 avatars?: AvatarData[];
 onEdit?: () => void;
 onShare?: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
 title = 'The principle of population, as it affects the future improvement of society',
 avatars = [
  { src: 'https://github.com/shadcnx.png', alt: '@shadcn', fallback: 'CN' },
  { src: 'https://github.com/maxleitder.png', alt: '@maxleiter', fallback: 'LR' },
  { src: 'https://github.com/evilrabbitd.png', alt: '@evilrabbit', fallback: 'ER' },
 ],
 onEdit,
 onShare,
}) => {
 const { open } = useSidebar();
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
    <AvatarGroup>
     {avatars.map((avatar) => (
      <Avatar key={avatar.alt}>
       <AvatarImage src={avatar.src} alt={avatar.alt} />
       <AvatarFallback>{avatar.fallback}</AvatarFallback>
      </Avatar>
     ))}
    </AvatarGroup>
    <EditorShareDialogButton onShare={onShare} />
   </div>
  </header>
 );
};