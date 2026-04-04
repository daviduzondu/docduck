import NotePage from "@/(document-view)/doc/[noteId]/page.client";
import { orpc } from "@/lib/orpc.client";

export default async function Page({ params }: { params: Promise<{ noteId: string }> }) {
 const { noteId } = await params;
 let result
 try {
  result = await orpc.documents.getPermissions({
   params: { documentId: noteId }
  });
  if (!result?.documentId) return <div>Hmm... This document does not exists.</div>;
  if (!result.canView) return <div>Hmmm... You need permission to view that</div>;
 } catch (error) {
  return <div>Hmmm...Something went wrong when fetching the document!</div>
  console.error(error);
 }

 return <NotePage canEdit={result.canEdit} />
}