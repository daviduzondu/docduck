import { Card, CardContent } from "@/components/ui/card";
import {
 Empty,
 EmptyDescription,
 EmptyHeader,
 EmptyMedia,
 EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { $api, orpc } from "@/lib/orpc.client";
import { useDocument } from "@/providers/document.provider";
import { isDefinedError } from "@orpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { History, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

type Snapshot = Awaited<ReturnType<typeof $api.documents.getSnapshots>>[number];

export default function Snapshots() {
 const documentId = useDocument((state) => state.documentId);
 const sentinelRef = useRef<HTMLDivElement>(null);

 const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isLoadingError, error } =
  useInfiniteQuery(
   orpc.documents.getSnapshots.infiniteOptions({
    input: (pageParam: number) => ({
     params: { documentId },
     query: { page: pageParam },
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
     lastPage.length === 15 ? lastPageParam + 1 : undefined,
   }),

  );

 useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel) return;

  const scrollContainer = sentinel.closest('[data-sidebar="content"]') as Element | null;

  const observer = new IntersectionObserver(
   (entries) => {
    if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
     fetchNextPage();
    }
   },
   {
    root: scrollContainer,
    threshold: 0.1,
   }
  );

  observer.observe(sentinel);
  return () => observer.disconnect();
 }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

 if (isLoading) {
  return (
   "quick brown fox".split("").map(() => <Card className="p-2 rounded-xl bg-transparent shrink-0">
    <CardContent className="flex flex-col gap-2 p-2">
     {/* Header row: avatar + name on left, date on right */}
     <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col gap-2">
       <Skeleton className="h-4 w-24 rounded-md" />
       <Skeleton className="h-3 w-16 rounded-md" />
      </div>
     </div>

     {/* Textarea placeholder */}
     <Skeleton className="h-4 w-full rounded-lg" />
    </CardContent>
   </Card>)
  );
 }

 const snapshots = data?.pages.flat() ?? [];

 // if (isLoadingError) {
 //  if (isDefinedError(error)) {
 //    return <div className="h-full flex flex-col">

 //    </div>
 //  }
 // }

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

   {/* Sentinel — triggers next page fetch when scrolled into view */}
   <div ref={sentinelRef} className="py-1">
    {isFetchingNextPage && (
     <div className="flex items-center justify-center py-2">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
     </div>
    )}
   </div>
  </div>
 );
}

function SnapshotCard({ snapshot }: { snapshot: Snapshot }) {
 const { setMode, setSnapshotId } = useDocument(
  useShallow((state) => ({
   setSnapshotId: state.setSnapshotId,
   setMode: state.setMode,
  }))
 );

 return (
  <Card className="transition-colors hover:bg-muted/50 rounded-xl cursor-pointer p-2">
   <CardContent
    className="flex flex-col gap-2 p-2"
    onClick={() => {
     setMode("diff");
     setSnapshotId(snapshot.id);
    }}
   >
    <div className="flex items-center justify-between gap-2">
     <div className="flex flex-col">
      <span className="text-base font-medium">
       {snapshot.name ??
        format(new Date(snapshot.createdAt), "MMM d, h:mm a")}
      </span>
     </div>
    </div>

    {snapshot.preview && (
     <div className="flex gap-0.5 text-sm text-muted-foreground">
      <div
       className={`truncate ${snapshot.preview.trim().length < 1 && "select-none"}`}
       dangerouslySetInnerHTML={{
        __html:
         snapshot.preview.trim().length > 1
          ? snapshot.preview
          : `<span>[EMPTY DOCUMENT]</span>`,
       }}
      />
     </div>
    )}
   </CardContent>
  </Card>
 );
}