import FindAndReplace from "@/components/editor/sidebar/find-and-replace";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "../../ui/sidebar";

export default function EditorSidebar({ view }: { view: "comments" | "history" | "search" | undefined }) {
 if (!view) return <></>
 return <Sidebar side="right" collapsible="offcanvas" className="absolute" >
  <SidebarHeader>
   <div className="text-lg">
    {
     view === 'comments' ? "Comments"
      : view === 'history' ? "Version History"
       : view === "search" ? "Find & Replace"
        : null
    }
   </div>
  </SidebarHeader>
  <SidebarContent className="p-1">
   {
    view === 'search' ? <FindAndReplace /> : null
   }
  </SidebarContent>
  <SidebarFooter />
 </Sidebar>
}