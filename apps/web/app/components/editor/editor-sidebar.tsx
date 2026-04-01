import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "../ui/sidebar";

export default function EditorSidebar() {
 return <Sidebar side="right" collapsible="offcanvas">
  <SidebarHeader />
  <SidebarContent>
   <SidebarGroup />
   <SidebarGroup />
  </SidebarContent>
  <SidebarFooter />
 </Sidebar>
}