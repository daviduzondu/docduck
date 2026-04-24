'use client'
import {
 FileText,
 PlusCircle,
 Share2,
 SidebarCloseIcon,
 Trash2,
} from 'lucide-react'

import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarGroup,
 SidebarGroupContent,
 SidebarGroupLabel,
 SidebarHeader,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const navItems = [
 { label: 'My Documents', icon: FileText, href: '/dashboard/documents' },
 { label: 'Shared with me', icon: Share2, href: '/dashboard/shared' },
 { label: 'Trash', icon: Trash2, href: '/dashboard/trash' },
]

export default function DashboardSidebar() {
 const { toggleSidebar } = useSidebar()
 return (
  <Sidebar variant="sidebar" collapsible="offcanvas">
   <SidebarHeader>
    <div className="flex items-center justify-between px-2 py-1">
     <span className="text-2xl font-bold">DocDuck</span>
     {/* <SidebarTrigger> */}
     <Button size={'icon-sm'} variant={'outline'} onClick={toggleSidebar}>
      <SidebarCloseIcon className="h-5 w-5" />
     </Button>

     {/* </SidebarTrigger> */}
    </div>
   </SidebarHeader>

   <SidebarContent>
    <SidebarGroup>
     <SidebarMenuItem>
      <SidebarMenuButton
      variant={'outline'}
       render={
        <div>
         <PlusCircle />
         <span>Create new Document</span>
        </div>
       }
      ></SidebarMenuButton>
     </SidebarMenuItem>
     <SidebarGroupLabel>Files</SidebarGroupLabel>
     <SidebarGroupContent>
      <SidebarMenu>
       {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
         <SidebarMenuButton
          render={
           <Link href={item.href}>
            <item.icon />
            <span>{item.label}</span>
           </Link>
          }
         ></SidebarMenuButton>
        </SidebarMenuItem>
       ))}
      </SidebarMenu>
     </SidebarGroupContent>
    </SidebarGroup>
   </SidebarContent>

   <SidebarFooter />
  </Sidebar>
 )
}
