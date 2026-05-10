'use client'
import {
  FileText,
  Monitor,
  Moon,
  PlusCircle,
  SidebarCloseIcon,
  SidebarOpenIcon,
  Sun,
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
import { useMutation } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc.client'
import { isDefinedError } from '@orpc/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const navItems = [
  { label: 'My Documents', icon: FileText, href: '/dashboard/documents' },
  { label: 'Trash', icon: Trash2, href: '/dashboard/trash' },
]

const themeOptions = [
  { label: 'Light', value: 'light', icon: Sun },
  { label: 'Dark', value: 'dark', icon: Moon },
  { label: 'System', value: 'system', icon: Monitor },
] as const

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const current = themeOptions.find((t) => t.value === theme) ?? (themeOptions[2])
  const CurrentIcon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton
          tooltip="Toggle theme"
          className="w-full"
        >
          <CurrentIcon className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">
            {current.label} mode
          </span>
        </SidebarMenuButton>}>
        
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-36"
      >
        {themeOptions.map(({ label, value, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center gap-2"
          >
            <Icon className="size-4" />
            {label}
            {theme === value && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function DashboardSidebar() {
  const router = useRouter()
  const { mutate: createDocument, isPending: isCreatingDocument } = useMutation(
    orpc.documents.createDocument.mutationOptions({
      onSuccess(data) {
        router.push('/doc/' + data.documentId)
      },
      onError(error) {
        console.error(error)
        if (isDefinedError(error)) toast.error(error.message)
        else toast.error('Failed to create document')
      },
    })
  )
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
          <SidebarMenuItem className="mb-3">
            <SidebarMenuButton
              tooltip="Create new Document"
              render={
                <Button
                  size={'lg'}
                  variant={'default'}
                  onClick={() => createDocument({})}
                  disabled={isCreatingDocument}
                  className="flex items-center justify-center w-full h-14 text-base font-semibold gap-2 bg-primary"
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
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}