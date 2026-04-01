import EditorSidebar from "@/components/editor/editor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <>
   {/* <AuthProvider> */}
   <SidebarProvider>
    {children}
    
    <EditorSidebar />
   </SidebarProvider>
   {/* </AuthProvider> */}
  </>
 );
}
