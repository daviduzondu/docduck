import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { $api, orpc } from "@/lib/orpc.client";
import { getUserColor } from "@/lib/utils";
import { useDocument } from "@/providers/document.provider";
import { Comment } from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Editor, useCurrentEditor } from "@tiptap/react";
import { useRef, useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";

export default function Comments() {
 const { editor } = useCurrentEditor();
 const { provider } = useDocument();
 const [comments, setComments] = useState<Record<string, Comment>>(provider.document.getMap('comments').toJSON());
 const [activeCommentId, setActiveCommentId] = useState(editor?.storage.comment.activeCommentId);

 const sortedComments = Object.values(comments)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

 const userQueries = useQueries({
  queries: sortedComments.map(comment =>
   orpc.users.getBasicUserInfo.queryOptions({
    input: { params: { userId: comment.commenterId } }
   })
  ),
 });

 const hasErrors = userQueries.some(q => q.isError);
 const retryFailed = () => userQueries.forEach(q => q.isError && q.refetch());


 useEffect(() => {
  const handleDocUpdate = () => {
   setComments({ ...provider.document.getMap('comments').toJSON() });
  };

  const handleSelectionUpdate = ({ editor }: { editor: Editor }) => {
   setActiveCommentId(editor.storage.comment.activeCommentId);
  };

  provider.document.on('update', handleDocUpdate);
  editor?.on('selectionUpdate', handleSelectionUpdate);

  return () => {
   provider.document.off('update', handleDocUpdate);
   editor?.off('selectionUpdate', handleSelectionUpdate);
  };
 }, [editor, provider.document]);

 return (
  <div>
   <div className="flex flex-col space-y-4">
    {hasErrors && (
     <div className="text-sm text-muted-foreground text-center flex items-center gap-2 m-auto mb-3">
      Some comments failed to load.
      <Button size={'sm'} className={'px-2'} variant={'outline'} onClick={retryFailed}
      >Retry</Button>
     </div>
    )}
    {sortedComments.map((comment, i) => {
     const query = userQueries[i];
     if (query) {
      if (query?.isPending) return <CommentSkeleton key={comment.id} />;
      if (query?.isError) return null;
      return (
       <CommentCard
        key={comment.id}
        comment={comment}
        activeCommentId={activeCommentId}
        userData={query.data}
       />
      );
     }
    })}
   </div>
  </div>
 );
}


function CommentCard({ comment, activeCommentId, userData }: { comment: Comment, activeCommentId: string | null | undefined, userData: Awaited<ReturnType<typeof $api.users.getBasicUserInfo>> }) {

 const commentRef = useRef<HTMLDivElement | null>(null);
 const isActive = activeCommentId === comment.id;

 useEffect(() => {
  if (isActive && commentRef.current) {
   commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
 }, [isActive]);


 const { name, image } = userData;

 return (
  <Card
   ref={commentRef}
   className={`cursor-pointer transition-colors ${isActive
    ? 'outline outline-[3px] outline-[rgba(218,113,7,0.61)] bg-[rgba(218,113,7,0.08)]'
    : 'bg-transparent'
    } p-2 rounded-xl`}
  >
   <CardContent className="p-1 flex flex-col space-y-3">
    <div className="flex items-center justify-between gap-2">
     <div className="flex items-center gap-2">
      <Avatar>
       <AvatarImage src={image ?? undefined} />
       <AvatarFallback
        className="text-background"
        style={{ background: getUserColor(comment.commenterId) }}
       >
        {name[0]}
       </AvatarFallback>
      </Avatar>
      <span className="font-medium text-sm">{name}</span>
     </div>
     <span className="text-xs text-muted-foreground shrink-0">
      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
     </span>
    </div>

    <Textarea
     readOnly
     value={comment.text}
     className="h-20 rounded-lg resize-none"
    />
   </CardContent>
  </Card>
 );
}


function CommentSkeleton() {
 return (
  <Card className="p-2 rounded-xl bg-transparent">
   <CardContent className="p-1 flex flex-col space-y-3">
    {/* Header row: avatar + name on left, date on right */}
    <div className="flex items-center justify-between gap-2">
     <div className="flex items-center gap-2">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-24 rounded-md" />
     </div>
     <Skeleton className="h-3 w-16 rounded-md" />
    </div>

    {/* Textarea placeholder */}
    <Skeleton className="h-20 w-full rounded-lg" />
   </CardContent>
  </Card>
 );
}