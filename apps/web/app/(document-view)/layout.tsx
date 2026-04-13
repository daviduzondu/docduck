import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorSidebarProvider } from "../providers/editor-sidebar.provider";
// import {gener} from 'next'

export default function Layout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <div className="overflow-hidden">
   {/* <AuthProvider> */}
   <SidebarProvider>
    <EditorSidebarProvider>
     {children}
    </EditorSidebarProvider>
   </SidebarProvider>
   {/* </AuthProvider> */}
  </div>
 );
}
