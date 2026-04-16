import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { $api, orpc } from "@/lib/orpc.client";
import { cn, getUserColor } from "@/lib/utils";
import { useDocument } from "@/providers/document.provider";
import { Comment } from "@/types";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Editor, useCurrentEditor } from "@tiptap/react";
import { useRef, useEffect, useState, SetStateAction, Dispatch } from "react";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Quote, Loader, MessageSquareOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { isDefinedError } from "@orpc/client";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { useAuth } from "@/providers/auth.provider";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

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
   console.log("Document updated, refreshing comments");
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

 const visibleComments = sortedComments.filter(c => !c.resolved);

 if (visibleComments.length === 0) {
  return <Empty>
   <EmptyHeader>
    <EmptyMedia variant="icon">
     <MessageSquareOff />
    </EmptyMedia>
    <EmptyTitle>Whoops! No comments here</EmptyTitle>
    <EmptyDescription>
     To create your first comment, highlight text in the Doc and click{" "}
     <span className="font-medium text-foreground">Add Comment</span>
    </EmptyDescription>
   </EmptyHeader>
  </Empty>
 }

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
    {visibleComments.map((comment) => {
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
 const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
 const isActive = activeCommentId === comment.id;
 const [isEditing, setIsEditing] = useState(false);
 const [isFocused, setIsFocused] = useState(false);
 const [textAreaValue, setTextAreaValue] = useState(comment.text);
 const { editor } = useCurrentEditor();
 const documentId = useDocument(state => state.documentId);
 const { data } = useAuth();
 const { mutate } = useMutation(orpc.documents.editComment.mutationOptions({
  onSuccess() {
   setIsEditing(false);
   toast.success("Comment updated");
  },
  onError(error) {
   textAreaRef.current?.focus();
   setTextAreaValue(comment.text);
   toast.error("Failed to update comment", { description: isDefinedError(error) ? error.message : "Something went wrong" });
  }
 }))

 useEffect(() => {
  if (isActive && commentRef.current) {
   commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
 }, [isActive]);


 useEffect(() => {
  if (isEditing) {
   textAreaRef.current?.focus();
  }
 }, [isEditing]);

 useEffect(() => {
  if (!isEditing) {
   setTextAreaValue(comment.text);
  }
 }, [comment.text, isEditing]);

 const { name, image } = userData;

 return (
  <Card
   ref={commentRef}
   tabIndex={0}
   onFocus={() => setIsFocused(true)}
   onBlur={() => setIsFocused(false)}
   className={`cursor-pointer transition-all ${isActive
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
     <CommentDropdownMenu commentId={comment.id} setIsEditing={setIsEditing} canEdit={comment.commenterId === data?.user?.id} />

    </div>
    <div className="flex text-muted-foreground">
     <span>“</span>
     <div className="truncate">{getCommentText(editor!, comment.id)}</div>
     <span>”</span>
    </div>
    {/* <div>{editor.selectElement("data-comment-id=$somerandomcommentId").textContent}</div> */}
    <InputGroup className={cn("has-data-[align=block-end]:rounded-lg has-[textarea]:rounded-lg")}>
     <InputGroupTextarea
      ref={textAreaRef}
      readOnly={!isEditing}
      value={textAreaValue}
      onChange={(e) => setTextAreaValue(e.target.value)}
     // className={}
     />
     {isEditing && isFocused ? <InputGroupAddon align="block-end" className=" w-full flex justify-between">
      <Button size="sm" variant="outline"
       onMouseDown={(e) => {
        e.preventDefault(); // stops focus from shifting
        setTextAreaValue(comment.text);
        setIsEditing(false);
       }}>
       Cancel
      </Button>
      <Button size="sm" variant="outline"
       onMouseDown={() => {
        // textAreaRef.current
        textAreaRef.current &&
         mutate({
          params: { documentId, commentId: comment.id },
          body: { text: textAreaRef.current?.value }
         })
       }}
       disabled={textAreaRef.current ? textAreaRef.current?.value?.trim()?.length <= 0 : true}

      >
       Submit
      </Button>
     </InputGroupAddon> : null}

    </InputGroup>
   </CardContent>
  </Card>
 );
}


function CommentDropdownMenu({ commentId, setIsEditing, canEdit }: { commentId: string, setIsEditing: Dispatch<SetStateAction<boolean>>, canEdit: boolean }) {
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
    {canEdit ? <DropdownMenuItem
     onClick={() => {
      setIsEditing(true)
     }}
    >Edit</DropdownMenuItem> : null}
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