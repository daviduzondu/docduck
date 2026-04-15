import { Card, CardContent } from "@/components/ui/card";
import { $api, orpc } from "@/lib/orpc.client";
import { useDocument } from "@/providers/document.provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function Snapshots() {
 const { documentId } = useDocument();
 const { data: snapshots } = useSuspenseQuery(orpc.documents.getSnapshots.queryOptions({
  input: { params: { documentId } }
 }));

 return <div className="flex flex-col gap-2">{snapshots.map(snapshot => <SnapshotCard snapshot={snapshot} />)}</div>
}

function SnapshotCard({ snapshot }: { snapshot: Awaited<ReturnType<typeof $api.documents.getSnapshots>>[number] }) {
 return (
  <Card
   className={`cursor-pointer transition-colors p-2 rounded-xl`}>
   <CardContent className="p-1 flex flex-col space-y-3">
    <div className="flex items-center justify-between gap-2">
     {formatDistanceToNow(new Date(snapshot.createdAt), { addSuffix: true })}

    </div>
    <div className="flex">
     <span>“</span>
     <div className="truncate" dangerouslySetInnerHTML={{ __html: snapshot.preview }}></div>
     <span>”</span>
    </div>
   </CardContent>
  </Card>
 );
}