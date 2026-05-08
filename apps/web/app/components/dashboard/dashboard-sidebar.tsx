'use client'
import {
 BookDashed,
 FileText,
 PlusCircle,
 PlusIcon,
 SidebarCloseIcon,
 SidebarOpenIcon,
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
import Image from 'next/image'
import DocDuckSmol from '@/../public/docduck-smol.png'

export const navItems = [
 { label: 'My Documents', icon: FileText, href: '/dashboard/documents' },
//  { label: 'Templates', icon: BookDashed, href: '/dashboard/templates' },
 { label: 'Trash', icon: Trash2, href: '/dashboard/trash' },
]

export default function DashboardSidebar() {
 const { toggleSidebar, open } = useSidebar()
 return (
  <Sidebar variant="sidebar" collapsible="icon">
   <SidebarHeader>
    <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:justify-center">
     <div className="flex items-center group-data-[collapsible=icon]:hidden">
      <span className="text-2xl font-bold">DocDuck</span>
     </div>

     <Button size={'icon-sm'} variant={'outline'} onClick={toggleSidebar}>
      {open ? (
       <SidebarCloseIcon className="h-5 w-5" />
      ) : (
       <SidebarOpenIcon className="h-5 w-5" />
      )}
     </Button>
    </div>
   </SidebarHeader>

   <SidebarContent>
    <SidebarGroup>
     <SidebarMenuItem className='mb-3'>
      <SidebarMenuButton
       tooltip="Create new Document"
       render={
        <Button
         size={'lg'}
         variant={'default'}
         className={
          'flex items-center justify-center w-full h-14 text-base font-semibold gap-2 bg-primary'
         }
        >
         <PlusCircle className="h-5 w-5 shrink-0" />
         <span className="group-data-[collapsible=icon]:hidden">
          Create new Document
         </span>
        </Button>
       }
      />
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
