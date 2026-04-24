import DashboardSidebar from '@/components/dashboard/dashboard-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from '@/providers/auth.provider'

export default function Layout({
 children,
 shared,
 documents,
 trash,
}: Readonly<{
 children: React.ReactNode

 documents: React.ReactNode
 shared: React.ReactNode
 trash: React.ReactNode
}>) {
 return (
  <div className="overflow-clip w-full flex">
   <AuthProvider>
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
   </AuthProvider>
  </div>
 )
}
