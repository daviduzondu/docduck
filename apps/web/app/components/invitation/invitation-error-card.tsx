'use client'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
 AlertCircle,
 ShieldAlert,
 LogIn,
 XCircle,
 LucideIcon,
} from 'lucide-react'

type InvitationErrorProps = {
 code: string
 description?: string
}

const ERROR_CONFIG: Record<
 string,
 { title: string; description: string; Icon: LucideIcon }
> = {
 CONFLICT: {
  title: 'Already accepted',
  description: "You've already accepted this invitation.",
  Icon: XCircle,
 },
 UNAUTHORIZED: {
  title: 'Sign in required',
  description:
   "You need to be logged in to accept this invitation. If you don't have an account, try creating one now.",
  Icon: LogIn,
 },
 FORBIDDEN: {
  title: 'Access denied',
  description: "Sorry, you're not allowed to accept this invitation.",
  Icon: ShieldAlert,
 },
 UNKNOWN: {
  title: 'Something went wrong',
  description: "We couldn't process this invitation. Please try again later.",
  Icon: AlertCircle,
 },
}

const linkBase =
 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm flex-1'

export function InvitationErrorCard({
 code,
 description,
}: InvitationErrorProps) {
 const config = ERROR_CONFIG[code] ?? ERROR_CONFIG.UNKNOWN
 const isUnauthorized = code === 'UNAUTHORIZED'
 const token = useSearchParams().get('token')
 const Icon = config?.Icon

 return (
  <div className="flex w-full min-h-screen items-center justify-center bg-muted/30 px-4">
   <Card className="w-full max-w-md shadow-lg">
    <CardHeader className="items-center pb-2 text-center">
     <div className="flex items-center justify-center w-full">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
       {Icon ? (
        <Icon className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
       ) : null}
      </div>
     </div>
     <CardTitle className="text-xl">{config?.title}</CardTitle>
     <CardDescription className="text-sm leading-relaxed">
      {description ?? (config?.description ?? null)}
     </CardDescription>
    </CardHeader>
    {isUnauthorized && (
     <CardContent className="flex gap-3 justify-center pb-8 pt-2">
      <Link
       href={`/auth/login?next=/invite/accept?token=${token}`}
       className={linkBase}
      >
       Login
      </Link>
      <Link
       href={`/auth/register?next=/invite/accept?token=${token}`}
       className={linkBase}
      >
       Create account
      </Link>
     </CardContent>
    )}
   </Card>
  </div>
 )
}
