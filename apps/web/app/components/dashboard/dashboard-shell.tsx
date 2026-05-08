'use client'

import DashboardBreadcrumb from '@/components/dashboard/dashboard-breadcrumb'
import { DocumentFilterPopover } from '@/components/dashboard/document-filter-popover'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
 InputGroup,
 InputGroupAddon,
 InputGroupInput,
} from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import useDashboard, {
 DashboardState,
 DashboardStore,
 DocumentFilter,
 SortOption,
} from '@/providers/dashboard.store'
import {
 ChevronLeft,
 ChevronRight,
 LayoutGrid,
 List,
 Search,
} from 'lucide-react'

export default function DashboardShell<K extends keyof DashboardState>({
 children,
 title,
 pageName,
 selector,
 //  handleSearch,
 getPrevPage,
 getNextPage,
 pageCount,
 onToggleFilter,
 onClearFilters,
 onSetActiveFilters,
 onSortChange,
}: {
 children?: React.ReactNode
 title: string
 pageName: keyof DashboardState
 selector: (state: DashboardStore) => DashboardState[K]
 getPrevPage: () => void
 getNextPage: () => void
 pageCount: () => void
 onToggleFilter: (filter: DocumentFilter) => void
 onSetActiveFilters: (filter: DocumentFilter[]) => void
 onClearFilters: () => void
 onSortChange: (sort: SortOption) => void
 //  handleSearch: () => void
}) {
 const dashboardState = useDashboard(selector)

 //  useEffect(() => {
 //   const timeout = setTimeout(() => {
 //    handleSearch()
 //    //    console.log(dashboardState.searchTerm)
 //   }, 500)

 //   return () => {
 //    clearTimeout(timeout)
 //   }
 //  }, [dashboardState.searchTerm])

 return (
  <div className="px-4 sm:px-6 w-full">
   <div className="pt-3 pb-6">
    <DashboardBreadcrumb />
   </div>
   <div className="flex flex-col w-full space-y-4">
    <div className="text-2xl sm:text-3xl font-medium">{title}</div>

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-accent/55 p-1.5 pl-2 rounded-2xl sm:rounded-full">
     {/* Left: search */}
     <InputGroup className="">
      <InputGroupInput
       placeholder="Search..."
       className="rounded-full h-8 w-28"
       value={dashboardState.searchTerm}
       onChange={(e) =>
        useDashboard.getState().setSearchTerm(pageName, e.target.value)
       }
      />
      <InputGroupAddon align="inline-end">
       <Search className="size-4 text-muted-foreground" />
      </InputGroupAddon>
     </InputGroup>

     {/* Right: controls */}
     <div className="flex items-center gap-2 sm:ml-auto flex-wrap sm:flex-nowrap">
      {/* Filter */}
      <DocumentFilterPopover
       activeFilters={dashboardState.activeFilters}
       sortBy={dashboardState.sortBy}
       onToggleFilter={onToggleFilter}
       onClearFilters={onClearFilters}
       onSortChange={onSortChange}
       onSetActiveFilters={onSetActiveFilters}
      />

      {/* Page arrows + doc count */}
      <div className="flex items-center gap-1.5 shrink-0">
       <ButtonGroup aria-label="Page navigation" className="flex items-center">
        <Button
         variant="outline"
         size="icon"
         className="size-8"
         disabled={dashboardState.currentPage <= 1}
         onClick={() => {
          getPrevPage()
          useDashboard
           .getState()
           .setCurrentPage(pageName, dashboardState.currentPage - 1 || 1)
         }}
        >
         <ChevronLeft className="size-4" />
        </Button>
        <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
         {dashboardState.currentPage} / {pageCount() ?? '?'}
        </span>
        <Button
         variant="outline"
         size="icon"
         className="size-8"
         disabled={dashboardState.currentPage === dashboardState.maxPages}
         onClick={() => {
          getNextPage()
          useDashboard
           .getState()
           .setCurrentPage(pageName, dashboardState.currentPage + 1)
         }}
        >
         <ChevronRight className="size-4" />
        </Button>
       </ButtonGroup>
      </div>
      {/* Grid / List toggle */}
      <ToggleGroup
       value={[dashboardState.view]}
       variant={'outline'}
       onValueChange={(v) =>
        v[0] &&
        useDashboard
         .getState()
         .setView(
          pageName as keyof DashboardState,
          v[0] as DashboardState[keyof DashboardState]['view']
         )
       }
       aria-label="View mode"
       //    className="shrink-0"
      >
       <ToggleGroupItem
        value="grid"
        variant={dashboardState.view === 'grid' ? 'outline' : 'default'}
        size="sm"
        aria-label="Grid view"
        // className="data-[state=on]:bg-primary"
       >
        <LayoutGrid className="size-4" />
       </ToggleGroupItem>
       <ToggleGroupItem
        value="list"
        size="sm"
        variant={dashboardState.view === 'list' ? 'outline' : 'default'}
        aria-label="List view"
       >
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
