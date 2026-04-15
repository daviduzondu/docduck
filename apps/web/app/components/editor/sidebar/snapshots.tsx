import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
 Empty,
 EmptyDescription,
 EmptyHeader,
 EmptyMedia,
 EmptyTitle,
} from "@/components/ui/empty";
import { $api, orpc } from "@/lib/orpc.client";
import { useDocument } from "@/providers/document.provider";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { History, RotateCcw } from "lucide-react";

type Snapshot = Awaited<ReturnType<typeof $api.documents.getSnapshots>>[number];

export default function Snapshots() {
 const { documentId } = useDocument();
 const { data: snapshots } = useSuspenseQuery(
  orpc.documents.getSnapshots.queryOptions({
   input: { params: { documentId } },
  })
 );

 if (snapshots.length === 0) {
  return (
   <Empty>
    <EmptyHeader>
     <EmptyMedia variant="icon">
      <History />
     </EmptyMedia>
     <EmptyTitle>No versions yet</EmptyTitle>
     <EmptyDescription>
      Document versions will appear here when they're available.
     </EmptyDescription>
    </EmptyHeader>
   </Empty>
  );
 }

 return (
  <div className="flex flex-col gap-2">
   {snapshots.map((snapshot) => (
    <SnapshotCard key={snapshot.id} snapshot={snapshot} />
   ))}
  </div>
 );
}

function SnapshotCard({ snapshot }: { snapshot: Snapshot }) {
 const queryClient = useQueryClient();
 const { documentId } = useDocument();

 const { mutate: restore, isPending } = useMutation(
  orpc.documents.restoreSnapshotbyId.mutationOptions({
   onSuccess: () => {
    queryClient.invalidateQueries(
     orpc.documents.getSnapshots.queryOptions({
      input: { params: { documentId } },
     })
    );
   },
  })
 );

 return (
  <Card className="transition-colors hover:bg-muted/50 rounded-xl cursor-pointer p-2">
   <CardContent className="flex flex-col gap-2 p-2">
    <div className="flex items-center justify-between gap-2">
     <div className="flex flex-col">
      <span className="text-base font-medium">
       {snapshot.name ?? "Untitled snapshot"}
      </span>
      <span className="text-sm text-muted-foreground">
       {formatDistanceToNow(new Date(snapshot.createdAt), {
        addSuffix: true,
       })}
      </span>
     </div>
     <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
       restore({ params: { documentId, snapshotId: snapshot.id } })
      }}
     >
      <RotateCcw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Restoring..." : "Restore"}
     </Button>
    </div>

    {snapshot.preview && (
     <div className="flex gap-0.5 text-sm text-muted-foreground">
      <div
       className={`truncate ${snapshot.preview.trim().length < 1 && "select-none"}`}
       dangerouslySetInnerHTML={{ __html: snapshot.preview.trim().length > 1 ? snapshot.preview : `<span>[EMPTY DOCUMENT]</span>` }}
      />
     </div>
    )}
   </CardContent>
  </Card>
 );
}