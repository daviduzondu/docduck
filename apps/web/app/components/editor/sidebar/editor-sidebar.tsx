import FindAndReplace from "@/components/editor/sidebar/find-and-replace";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "../../ui/sidebar";
import Comments from "@/components/editor/sidebar/comments";

export default function EditorSidebar({ view }: { view: "comments" | "history" | "search" | undefined }) {
 if (!view) return <></>
 return <Sidebar side="right" collapsible="offcanvas" className="absolute" >
  <SidebarHeader>
   <div className="text-lg px-2">
    {
     view === 'comments' ? "Comments"
      : view === 'history' ? "Version History"
       : view === "search" ? "Find & Replace"
        : null
    }
   </div>
  </SidebarHeader>
  <SidebarContent className="px-2 py-1 relative scroll-p-80">
   {
    view === 'search' ? <FindAndReplace />
     : view === 'comments' ? <Comments />
      : null
   }
  </SidebarContent>
  <SidebarFooter />
 </Sidebar>
}