import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { $api, orpc } from "@/lib/orpc.client";
import { getUserColor } from "@/lib/utils";
import { useDocument } from "@/providers/document.provider";
import { Comment } from "@/types";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Editor, useCurrentEditor } from "@tiptap/react";
import { useRef, useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Quote, Loader } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { isDefinedError } from "@orpc/client";

function getCommentText(editor: Editor, commentId: string): string {
 const texts: string[] = [];

 editor.state.doc.descendants((node) => {
  if (node.isText) {
   const hasCommentMark = node.marks.some(
    (mark) => mark.type.name === 'comment' && mark.attrs.commentId === commentId
   );
   if (hasCommentMark) texts.push(node.text ?? '');
  }
 });

 return texts.join('');
}

export default function Comments() {
 const { editor } = useCurrentEditor();
 const { provider } = useDocument();
 const [comments, setComments] = useState<Record<string, Comment>>(provider.document.getMap('comments').toJSON());
 const [activeCommentId, setActiveCommentId] = useState(editor?.storage.comment.activeCommentId);

 const sortedComments = Object.values(comments)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

 const uniqueUserIds = Array.from(
  new Set(sortedComments.map(c => c.commenterId))
 );
 const userQueries = useQueries({
  queries: uniqueUserIds.map(userId =>
   orpc.users.getBasicUserInfo.queryOptions({
    input: { params: { userId } }
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
    {sortedComments.filter(comment => !comment.resolved).map((comment) => {
     const userDataById = new Map(
      sortedComments
       .map(c => c.commenterId)
       .filter((id, index, arr) => arr.indexOf(id) === index)
       .map((id, i) => [id, userQueries[i]])
     );
     const query = userDataById.get(comment.commenterId);

     if (!query) return null;

     if (query.isPending) {
      return <CommentSkeleton key={comment.id} />;
     }

     if (query.isError) {
      return null;
     }

     return (
      <CommentCard
       key={comment.id}
       comment={comment}
       activeCommentId={activeCommentId}
       userData={query.data}
      />
     );
    })}
   </div>
  </div>
 );
}


function CommentCard({ comment, activeCommentId, userData }: { comment: Comment, activeCommentId: string | null | undefined, userData: Awaited<ReturnType<typeof $api.users.getBasicUserInfo>> }) {

 const commentRef = useRef<HTMLDivElement | null>(null);
 const isActive = activeCommentId === comment.id;
 const { editor } = useCurrentEditor();

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
    ? 'outline-[3px] outline-primary bg-primary/10'
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
      <div className="">
       <div className="font-medium text-sm">{name}</div>
       <div className="text-xs text-muted-foreground shrink-0">
        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
       </div>
      </div>
     </div>
     <CommentDropdownMenu commentId={comment.id} />
     {/* <span className="text-xs text-muted-foreground shrink-0">
      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
     </span> */}
    </div>
    <div className="flex text-muted-foreground">
     <span>“</span>
     <div className="truncate">{getCommentText(editor!, comment.id)}</div>
     <span>”</span>
    </div>
    {/* <div>{editor.selectElement("data-comment-id=$somerandomcommentId").textContent}</div> */}
    <Textarea
     readOnly
     value={comment.text}
     className="h-20 rounded-lg resize-none"
    />
   </CardContent>
  </Card>
 );
}


function CommentDropdownMenu({ commentId }: { commentId: string }) {
 const documentId = useDocument(state => state.documentId);
 const { editor } = useCurrentEditor();
 const { mutate, isPending } = useMutation(orpc.documents.resolveComment.mutationOptions({
  onSuccess() {
   editor?.commands.resolveComment(commentId)
  },
  onError(error) {
   toast.error("Failed to resolve comment", { description: isDefinedError(error) ? error.message : "Something went wrong" })
  }
 }))
 return <DropdownMenu>
  <DropdownMenuTrigger render={<Button variant={'ghost'} size={'icon-sm'} />}>
   {isPending ? <Loader className="animate-spin" /> : <EllipsisVertical />}
  </DropdownMenuTrigger>
  <DropdownMenuContent>
   <DropdownMenuGroup>
    <DropdownMenuItem
     disabled={isPending}
     onClick={() => {
      mutate({ params: { documentId, commentId } })
     }}>{isPending ? "Resolving" : "Resolve"}</DropdownMenuItem>
    <DropdownMenuItem>Edit</DropdownMenuItem>
   </DropdownMenuGroup>
   <DropdownMenuSeparator />
   <DropdownMenuGroup>
    <DropdownMenuItem>Delete</DropdownMenuItem>
   </DropdownMenuGroup>
  </DropdownMenuContent>
 </DropdownMenu>
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