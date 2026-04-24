'use client'

import DashboardBreadcrumb from '@/components/dashboard/dashboard-breadcrumb'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
 InputGroup,
 InputGroupAddon,
 InputGroupInput,
} from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
 ChevronLeft,
 ChevronRight,
 Filter,
 LayoutGrid,
 List,
 Search,
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardShell({
 children,
 title,
}: {
 children?: React.ReactNode
 title: string
}) {
 const [view, setView] = useState<string>('grid')

 return (
  <div className="px-4 sm:px-6 w-full">
   <div className="pt-3 pb-6">
    <DashboardBreadcrumb />
   </div>
   <div className="flex flex-col w-full space-y-4">
    <div className="text-2xl sm:text-3xl font-medium">{title}</div>

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-accent/55 p-1.5 pl-2 rounded-2xl sm:rounded-full">
     {/* Left: search */}
     <InputGroup className="sm:w-52 shrink-0">
      <InputGroupInput placeholder="Search..." className="rounded-full h-8" />
      <InputGroupAddon align="inline-end">
       <Search className="size-4 text-muted-foreground" />
      </InputGroupAddon>
     </InputGroup>

     {/* Right: controls */}
     <div className="flex items-center gap-2 sm:ml-auto flex-wrap sm:flex-nowrap">
      {/* Filter */}
      <Button variant="ghost" size="sm" className="rounded-full shrink-0">
       <Filter className="size-4" />
       Filters
      </Button>

      {/* Page arrows + doc count */}
      <div className="flex items-center gap-1.5 shrink-0">
       <ButtonGroup aria-label="Page navigation" className="flex items-center">
        <Button variant="outline" size="icon" className="size-8">
         <ChevronLeft className="size-4" />
        </Button>
        <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
         1 / 100
        </span>
        <Button variant="outline" size="icon" className="size-8">
         <ChevronRight className="size-4" />
        </Button>
       </ButtonGroup>
      </div>

      {/* Grid / List toggle */}
      <ToggleGroup
       value={[view]}
       onValueChange={(v) => v[0] && setView(v[0])}
       aria-label="View mode"
       className="shrink-0"
      >
       <ToggleGroupItem value="grid" size="sm" aria-label="Grid view">
        <LayoutGrid className="size-4" />
       </ToggleGroupItem>
       <ToggleGroupItem value="list" size="sm" aria-label="List view">
        <List className="size-4" />
       </ToggleGroupItem>
      </ToggleGroup>
     </div>
    </div>
   </div>

   {children}
  </div>
 )
}
