import NotePage from "@/(document-view)/doc/[noteId]/page.client";
import AuthGuard from "@/guards/auth.guard";
import { orpc } from "@/lib/orpc.client";

export default async function Page({ params }: { params: Promise<{ noteId: string }> }) {
 const { noteId } = await params;
 try {
  const result = await orpc.documents.getDocument({
   params: { documentId: noteId }
  });
  console.log(result)
 } catch (error) {
  console.error(error);
 }

 return <AuthGuard next={"/doc/" + noteId}>
  <NotePage />
 </AuthGuard>
}