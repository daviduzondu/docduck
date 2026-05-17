import DocPage from '@/(document-view)/doc/[docId]/page.client'
import { authClient } from '@/lib/auth.client'
import { $api } from '@/lib/orpc.client'
import { DocumentProvider } from '@/providers/document.provider'
import { safe } from '@orpc/client'
import { headers } from 'next/headers'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/ui/card'
import { FileX2, Lock, LogIn, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import TipTapEditorProvider from '@/providers/editor.provider'

function StateCard({
 icon: Icon,
 title,
 description,
 action,
}: {
 icon: React.ElementType
 title: string
 description: string
 action?: React.ReactNode
}) {
 return (
  <div className="flex w-full min-h-screen items-center justify-center bg-muted/30 px-4">
   <Card className="w-full max-w-md shadow-lg">
    <CardHeader className="items-center pb-2 text-center">
     <div className="flex items-center justify-center w-full">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
       <Icon className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
     </div>
     <CardTitle className="text-xl">{title}</CardTitle>
     <CardDescription className="text-sm leading-relaxed">
      {description}
     </CardDescription>
    </CardHeader>
    {action && (
     <CardContent className="flex justify-center">{action}</CardContent>
    )}
   </Card>
  </div>
 )
}

export default async function Page({
 params,
}: {
 params: Promise<{ docId: string }>
}) {
 const { docId } = await params
 const session = await authClient.getSession({
  fetchOptions: { headers: await headers() },
 })

 const { data: result } = await safe(
  $api.documents.getDocumentWithPermissions({
   params: { documentId: docId },
  })
 )

 if (!result?.meta)
  return (
   <StateCard
    icon={FileX2}
    title="Document not found"
    description="This document was either deleted, moved, or never existed in the first place."
    action={
     <Button variant="outline">
      <Link href="/">Go home</Link>
     </Button>
    }
   />
  )

 if (!result?.permissions.canView && session.data)
  return (
   <StateCard
    icon={Lock}
    title="Access restricted"
    description="You don't have permission to view this document. Ask the owner to share it with you."
    action={
     <Button variant="outline">
      <Link href="/">Go home</Link>
     </Button>
    }
   />
  )

 if (!result?.permissions.canView && !session.data)
  return (
   <StateCard
    icon={LogIn}
    title="Sign in to continue"
    description="This document is private. Login in to see if you have access."
    action={
     <Button>
      <Link href="/auth/login">Login in</Link>
     </Button>
    }
   />
  )

 if (!result)
  return (
   <StateCard
    icon={ServerCrash}
    title="Something went wrong"
    description="We couldn't load this document right now. Try refreshing the page or come back later."
    action={
     <Button variant="outline">
      <Link href="/">Go home</Link>
     </Button>
    }
   />
  )

 return (
  <DocumentProvider documentId={docId} title={result.meta.title}>
   <TipTapEditorProvider canEdit={result.permissions.canEdit}>
    <DocPage
     visibility={result.meta.visibility}
     initialCanEdit={result.permissions.canEdit}
     initialRole={result.permissions.role}
    />
   </TipTapEditorProvider>
  </DocumentProvider>
 )
}
