import { CardFooter } from "@/components/tiptap-ui-primitive/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/lib/orpc.client";
import { getUserColor } from "@/lib/utils";
import { useDocument } from "@/providers/document.provider";
import { AwarenessStates, Comment } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Editor, useCurrentEditor } from "@tiptap/react";
import { useRef, useEffect, useState } from "react";


export default function Comments() {
 const { editor } = useCurrentEditor();
 const { provider } = useDocument();
 const [comments, setComments] = useState<Record<string, Comment>>(provider.document.getMap('comments').toJSON());
 const [activeCommentId, setActiveCommentId] = useState(editor?.storage.comment.activeCommentId);


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
    {Object.values(comments)
     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .map(comment => (
      <CommentCard
       key={comment.id}
       comment={comment}
       activeCommentId={activeCommentId}
      />
     ))}
   </div>
  </div>
 );
}

function CommentCard({ comment, activeCommentId }: { comment: Comment, activeCommentId: string | null | undefined }) {
 const getBasicUserInfoQuery = useQuery(orpc.users.getBasicUserInfo.queryOptions({
  input: {
   params: {
    userId: comment.commenterId
   }
  }
 }));
 const commentRef = useRef<HTMLDivElement | null>(null);
 const isActive = activeCommentId === comment.id;

 useEffect(() => {
  if (isActive && commentRef.current) {
   commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
 }, [isActive]);

 if (getBasicUserInfoQuery.data)
  return (
   <Card
    ref={commentRef}
    className={` cursor-pointer ${isActive ? 'outline-[3px] outline-[rgba(218,113,7,0.61)] bg-[rgba(218,113,7,0.08)]' : 'bg-transparent'} p-2 rounded-xl`}
    onClick={() => {
     // editor.
    }}
   >
    <CardContent className="p-1 flex flex-col space-y-3">
     <div className="flex items-center gap-2">

      <Avatar>
       <AvatarImage src={getBasicUserInfoQuery.data.image ?? undefined} />
       <AvatarFallback className={'text-background'} style={{
        background: getUserColor(comment.commenterId)
       }}>{getBasicUserInfoQuery.data.name[0]}</AvatarFallback>
      </Avatar>{getBasicUserInfoQuery.data.name}</div>
     <Textarea
      value={comment.text}
      className="h-20 rounded-lg"
     />
    </CardContent>
   </Card>
  );
}

function CommentSkeleton() {

}