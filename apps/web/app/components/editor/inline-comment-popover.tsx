"use client"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import {
 Popover,
 PopoverContent,
 PopoverDescription,
 PopoverHeader,
 PopoverTitle,
 PopoverTrigger
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { orpc } from "@/lib/orpc.client"
import { useAuth } from "@/providers/auth.provider"
import { useDocument } from "@/providers/document.provider"
import { useMutation } from "@tanstack/react-query"
import { useCurrentEditor } from "@tiptap/react"
import { MessageSquareText } from "lucide-react"
import { RefObject, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function InlineCommentPopover() {
 const [open, setOpen] = useState(false);
 const { editor } = useCurrentEditor();
 const [comment, setComment] = useState('');
 const { data } = useAuth();
 const { documentId } = useDocument();
 const addCommentMutation = useMutation(orpc.documents.addNewComment.mutationOptions({
  // onSuccess() {
  //  toast.success("Comment added")
  // },
  onSuccess(data) {
   const { commentId, parentId } = data;
   editor?.commands.setComment(commentId);
   toast.success("Comment added");
  },
  onError(error) {
   toast.error("Failed to add comment", { description: error.message })
  },
 }));

 if (editor && data)
  return (
   <>
    <Popover
     open={open}
     onOpenChange={setOpen}
    >
     <PopoverTrigger
      render={<Button size='sm' className={'cursor-pointer hover:bg-primary'}
       onClick={() => setOpen(true)}

      >
       <MessageSquareText /> Add comment
      </Button>} />
     <PopoverContent align="center"
     >
      <PopoverHeader>
       <PopoverTitle>Add new comment</PopoverTitle>
      </PopoverHeader>
      <div>
       <Textarea id="textarea-message" placeholder="Type your message here." rows={4} value={comment} onChange={e => {
        setComment(e.target.value);
       }} />
      </div>
      <div className="text-end">
       <Button variant={'secondary'}
        disabled={comment.length <= 0}
        onClick={() => {
         addCommentMutation.mutate({
          params: { documentId },
          body: { text: comment }
         });
         setOpen(false);
        }}
       >Add</Button>
      </div>
     </PopoverContent>
    </Popover>
   </>
  )
}
