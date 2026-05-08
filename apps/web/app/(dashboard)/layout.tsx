import DashboardSidebar from '@/components/dashboard/dashboard-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import AuthGuard from '@/guards/auth.guard'
import { AuthProvider } from '@/providers/auth.provider'

export default function Layout({
 children,
}: Readonly<{
 children: React.ReactNode
}>) {
 return (
  <div className="overflow-clip w-full flex">
   <AuthProvider>
    <AuthGuard>
     <SidebarProvider
      style={
       {
        '--sidebar-width': '20rem',
        '--sidebar-width-mobile': '20rem',
       } as React.CSSProperties
      }
      defaultOpen={true}
     >
      <DashboardSidebar />
      <div className="p-2 w-full">{children}</div>
     </SidebarProvider>
    </AuthGuard>
   </AuthProvider>
  </div>
 )
}
