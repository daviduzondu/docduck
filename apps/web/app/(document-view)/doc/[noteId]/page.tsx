import NotePage from "@/(document-view)/doc/[noteId]/page.client";
import AuthGuard from "@/guards/auth.guard";

export default async function Page({ params }: { params: Promise<{ noteId: string }> }) {
 const { noteId } = await params;

 return <AuthGuard next={"/doc/" + noteId}>
  <NotePage />
 </AuthGuard>
}