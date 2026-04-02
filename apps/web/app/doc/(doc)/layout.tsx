import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorSidebarProvider } from "../../providers/editor-sidebar.provider";

export default function Layout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <body className="overflow-hidden">
   {/* <AuthProvider> */}
   <SidebarProvider>
    <EditorSidebarProvider>
     {children}
    </EditorSidebarProvider>
   </SidebarProvider>
   {/* </AuthProvider> */}
  </body>
 );
}
