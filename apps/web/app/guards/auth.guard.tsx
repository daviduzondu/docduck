'use client'

import { useEffect } from 'react'
import { useAuth } from '@/providers/auth.provider'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthGuard({
 children,
 next,
}: {
 children: React.ReactNode
 next?: string
}) {
 const { data, isPending } = useAuth()
 const router = useRouter()
 const pathname = usePathname()

 useEffect(() => {
  sessionStorage.setItem('redirectAfterAuth', next ? next : pathname)
  if (!isPending && !data) {
   router.replace('/auth/login')
  }
 }, [isPending, data, router, next, pathname])

 if (isPending || !data) return null

 return <>{children}</>
}
