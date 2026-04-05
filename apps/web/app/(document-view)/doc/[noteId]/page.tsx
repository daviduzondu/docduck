import DocPage from "@/(document-view)/doc/[noteId]/page.client";
import { authClient } from "@/lib/auth.client";
import { orpc } from "@/lib/orpc.client";
import { headers } from 'next/headers';

export default async function Page({ params }: { params: Promise<{ noteId: string }> }) {
 const { noteId } = await params;
 const session = await authClient.getSession({
  fetchOptions: {
   headers: await headers()
  }
 });
 let result
 try {
  result = await orpc.documents.getDocumentWithPermissions({
   params: { documentId: noteId }
  });
  console.log({ canEdit: result.permissions.canEdit, user: session.data?.user.email })
  if (!result?.meta.documentId) return <div>Hmm... This document does not exists.</div>;
  if (!result.permissions.canView && session.data) return <div>Hmmm... You need permission to view that...</div>;
  if (!result.permissions.canView && !session.data) return <div>Hmm...You need to be signed in first.</div>
 } catch (error) {
  return <div>Hmmm...Something went wrong when fetching the document!</div>
 }

 return <DocPage canEdit={result.permissions.canEdit} title={result.meta.title} />
}