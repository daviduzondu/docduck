import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "../ui/sidebar";

export default function EditorSidebar({ view }: { view: "comments" | "history" | "search" | undefined }) {
 if (!view) return <></>

 return <Sidebar side="right" collapsible="offcanvas" className="absolute" >
  <SidebarHeader>
   <div className="text-xl">
    {
     view === 'comments' ? "Comments"
      : view === 'history' ? "Version History"
       : view === "search" ? "Find & Replace"
        : null
    }
   </div>
  </SidebarHeader>
  <SidebarContent>
   <SidebarGroup />
   <SidebarGroup />
  </SidebarContent>
  <SidebarFooter />
 </Sidebar>
}