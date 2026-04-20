'use client'

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
 AlertCircle,
 ShieldAlert,
 LogIn,
 XCircle,
 LucideIcon
} from "lucide-react"

type InvitationErrorProps = {
 code: string
 description?: string
}

const ERROR_CONFIG: Record<
 string,
 {
  title: string
  description: string
  Icon: LucideIcon
 }
> = {
 CONFLICT: {
  title: "Already accepted",
  description:
   "You've already accepted this invitation.",
  Icon: XCircle,
 },
 UNAUTHORIZED: {
  title: "Sign in required",
  description:
   "You need to be logged in to accept this invitation. If you don't have an account, try creating one now.",
  Icon: LogIn,
 },
 FORBIDDEN: {
  title: "Access denied",
  description:
   "Sorry, you're not allowed to accept this invitation.",
  Icon: ShieldAlert,
 },
 UNKNOWN: {
  title: "Something went wrong",
  description:
   "We couldn't process this invitation. Please try again later.",
  Icon: AlertCircle,
 },
}

export function InvitationErrorCard({ code, description }: InvitationErrorProps) {
 const config = ERROR_CONFIG[code] ?? ERROR_CONFIG.UNKNOWN
 const isUnauthorized = code === "UNAUTHORIZED"
 const token = useSearchParams().get("token")
 const Icon = config?.Icon

 return (
  <Card className="w-full max-w-md text-center">
   <CardHeader>
    <div className="flex flex-col items-center gap-2 mb-2">
     {Icon ? <Icon className="text-muted-foreground" size={30} /> : null}
     <CardTitle className="text-xl">{config?.title}</CardTitle>
    </div>

    <CardDescription className="text-sm">
     {description ?? config?.description}
    </CardDescription>

    {isUnauthorized ? (
     <div className="flex space-x-3 w-full mt-4">
      <Link
       href={`/auth/login?next=/invite/accept?token=${token}`}
       className="shrink-0 flex-1"
      >
       <Button variant="outline" className="w-full">
        Login
       </Button>
      </Link>

      <Link
       href={`/auth/register?next=/invite/accept?token=${token}`}
       className="shrink-0 flex-1"
      >
       <Button variant="outline" className="w-full">
        Create Account
       </Button>
      </Link>
     </div>
    ) : null}
   </CardHeader>
  </Card>
 )
}