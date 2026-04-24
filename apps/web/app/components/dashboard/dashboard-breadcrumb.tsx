'use client'

import {
 Breadcrumb,
 BreadcrumbItem,
 BreadcrumbLink,
 BreadcrumbList,
 BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const breadcrumbMap: Record<string, { name: string; href: string }> = {
 documents: {
  href: '/dashboard/documents',
  name: 'My Documents',
 },
 shared: {
  href: '/dashboard/shared',
  name: 'Shared With Me',
 },
}

export default function DashboardBreadcrumb() {
 const pathname = usePathname()
 const breadcrumbs = pathname
  .split('/')
  .map((x, i) => (i === 0 ? 'home' : x))
  .map((b) => ({
   name: breadcrumbMap[b]
    ? breadcrumbMap[b]?.name
    : b[0]?.toUpperCase() + b.substring(1),
   href: breadcrumbMap[b]?.name
    ? breadcrumbMap[b].href
    : b === 'home'
      ? '/'
      : '/' + b,
  }))

 return (
  <Breadcrumb>
   <BreadcrumbList>
    {breadcrumbs.map((breadcrumb, index) => (
     <>
      <BreadcrumbItem key={breadcrumb.name}>
       <BreadcrumbLink render={<Link href={breadcrumb.href} />}>
        {breadcrumb.name}
       </BreadcrumbLink>
      </BreadcrumbItem>
      {index !== breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
     </>
    ))}
   </BreadcrumbList>
  </Breadcrumb>
 )
}
