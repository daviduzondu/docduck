import FindAndReplace from "@/components/editor/sidebar/find-and-replace";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "../../ui/sidebar";
import Comments from "@/components/editor/sidebar/comments";
import Snapshots from "@/components/editor/sidebar/snapshots";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function EditorSidebar({ view }: { view: "comments" | "history" | "search" | undefined }) {
 if (!view) return <></>
 return <Sidebar side="right" collapsible="offcanvas" className="absolute" >
  <SidebarHeader className="">
   <div className="text-lg ">
    {
     view === 'comments' ? "Comments"
      : view === 'history' ?
       <div className="flex items-center justify-between">Version History <Button size={'sm'} variant={'outline'}>
        <PlusCircle  />
        New version</Button>
       </div>
       : view === "search" ? "Find & Replace"
        : null
    }
   </div>
  </SidebarHeader>
  <SidebarContent className="px-2 py-1 h-full pb-20 relative scroll-p-80">
   {
    view === 'search' ? <FindAndReplace />
     : view === 'comments' ? <Comments />
      : view === 'history' ? <Snapshots />
       : null
   }
  </SidebarContent>
  <SidebarFooter />
 </Sidebar>
}