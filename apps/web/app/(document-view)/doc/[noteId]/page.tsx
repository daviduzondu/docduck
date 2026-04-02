import { checkDocumentPermissions } from "../../../api/document";
import AuthGuard from "../../../guards/auth.guard";
import NotePage from "./page.client";

export default async function Page({ params }: { params: Promise<{ noteId: string }> }) {
 const { noteId } = await params;
 const permission = await checkDocumentPermissions(noteId);

 return <AuthGuard next={"/doc/" + noteId}>
  <NotePage />
 </AuthGuard>
}