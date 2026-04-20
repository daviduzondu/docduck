import { $api } from "@/lib/orpc.client"
import { isDefinedError, safe } from "@orpc/client"
import { InvitationErrorCard } from "@/components/invitation/invitation-error-card"
import { InvalidTokenCard } from "@/components/invitation/invalid-token-card"
import { redirect } from "next/navigation";

export default async function Page({
 searchParams,
}: { searchParams: any }) {
 const sp = await searchParams;
 const token = Array.isArray(await sp.token)
  ? sp.token[0]
  : sp.token

 console.log(token);
 if (!token) {
  return <div className="flex  h-screen w-screen overflow-hidden items-center justify-center"><InvalidTokenCard /></div>
 }

 const { error, data } = await safe(
  $api.invitations.acceptDocumentInvitation({ params: { id: token } })
 )

 if (error) {
  const code = isDefinedError(error) ? error.code : "UNKNOWN"
  return <div className="flex  h-screen w-screen overflow-hidden items-center justify-center"><InvitationErrorCard code={code} description={isDefinedError(error) ? error.message : undefined} /></div>
 }

 // handle success
 redirect("/doc/" + data.documentId, 'replace')
}