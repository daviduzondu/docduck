import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/providers/auth.provider";

export default function Layout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <div className="overflow-clip">
   <AuthProvider>
    <SidebarProvider defaultOpen={true}>
     <DashboardSidebar />
     {children}
    </SidebarProvider>
   </AuthProvider>
  </div>
 );
}
