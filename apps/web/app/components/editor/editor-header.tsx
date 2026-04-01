import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit3 } from 'lucide-react';
import { LockIcon } from 'lucide-react';

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
  title = 'Quarterly Report (Q3 2024)',
  avatars = [
    { src: 'https://github.com/shadcn.png', alt: '@shadcn', fallback: 'CN' },
    { src: 'https://github.com/maxleiter.png', alt: '@maxleiter', fallback: 'LR' },
    { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit', fallback: 'ER' },
  ],
  onEdit,
  onShare,
}) => {
  return (
    <header className="flex w-full items-center px-3 py-1 justify-between">
      <div className="text-2xl font-bold grow basis-0">🦆 DocDuck</div>

      <div className="w-[25%] text-center space-x-1">
        <div className="truncate text-center inline">{title}</div>
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
        <Button size="lg" onClick={onShare}>
          <LockIcon data-icon="inline-end" />
          Share
        </Button>
      </div>
    </header>
  );
};