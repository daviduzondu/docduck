import NotePage from "@/(document-view)/doc/[noteId]/page.client";
import AuthGuard from "@/guards/auth.guard";
import { orpc } from "@/lib/orpc.client";

export default async function Page({ params }: { params: Promise<{ noteId: string }> }) {
 const { noteId } = await params;
 try {
  const result = await orpc.documents.getPermissions({
   params: { documentId: noteId }
  });
  console.log(result);
  if (!result?.documentId) return <div>Hmm... This document does not exists.</div>;
  if (result.visibility === "PRIVATE" && !result.role) return <div>Hmmm... You need permission to view that</div>;
 } catch (error) {
  return <div>Hmmm...Something went wrong when fetching the document!</div>
  console.error(error);
 }

 return <NotePage />
}