'use client'

import DashboardShell from '@/components/dashboard/dashboard-shell'
import {
 Avatar,
 AvatarFallback,
 AvatarGroup,
 AvatarGroupCount,
 AvatarImage,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import { $api, orpc } from '@/lib/orpc.client'
import { getUserColor } from '@/lib/utils'
import {
 keepPreviousData,
 useMutation,
 useQuery,
 useQueryClient,
} from '@tanstack/react-query'
import {
 createColumnHelper,
 flexRender,
 getCoreRowModel,
 getPaginationRowModel,
 getSortedRowModel,
 useReactTable,
 type SortingState,
 type Row,
} from '@tanstack/react-table'
import { formatRelative } from 'date-fns'
import { MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import useDashboard, { DocumentFilter } from '@/providers/dashboard.store'
import { useShallow } from 'zustand/react/shallow'
import { useDebounce } from 'use-debounce'
import { SortButton } from '@/components/dashboard/sort-button'
import { isDefinedError } from '@orpc/client'
import { toast } from 'sonner'
import { useAlert } from '@/hooks/use-alert'
import { useConfirm } from '@/providers/confirm-provider'

type DocumentRow = Awaited<
 ReturnType<typeof $api.documents.getTrashedDocuments>
>['data'][number]

const columnHelper = createColumnHelper<DocumentRow>()

function useTrashActions(id: string) {
 const queryClient = useQueryClient()
 const confirm = useConfirm()

 const { mutate: restore, isPending: isRestoring } = useMutation(
  orpc.documents.restoreDocumentById.mutationOptions({
   onSuccess() {
    toast.success('Document restored!')
    queryClient.invalidateQueries({
     queryKey: orpc.documents.getTrashedDocuments.queryKey({ input: {} }),
    })
   },
   onError(error) {
    if (isDefinedError(error)) {
     toast.error(error.message)
    } else {
     toast.error('Failed to restore from trash')
    }
   },
  })
 )

 const handleRestore = async (e: React.MouseEvent) => {
  e.stopPropagation()
  if (
   await confirm({
    title: 'Are you sure you want to restore this document?',
    confirmLabel: 'Yes, restore',
    variant: 'default',
   })
  ) {
    restore({ params: { documentId: id } })
  }
 }

 const handleDeletePermanently = (e: React.MouseEvent) => {
  e.stopPropagation()
  // TODO: wire up permanent delete mutation
 }

 return { handleRestore, handleDeletePermanently, isRestoring }
}

function ActionsMenu({ row }: { row: Row<DocumentRow> }) {
 const { handleRestore, handleDeletePermanently, isRestoring } =
  useTrashActions(row.original.id)

 return (
  <DropdownMenu>
   <DropdownMenuTrigger
    render={
     <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={(e) => e.stopPropagation()}
     />
    }
   >
    <MoreHorizontal className="size-4" />
   </DropdownMenuTrigger>
   <DropdownMenuContent align="end">
    <DropdownMenuItem disabled={isRestoring} onClick={handleRestore}>
     <RotateCcw className="size-4" />
     Restore
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
     className="text-destructive focus:text-destructive"
     onClick={handleDeletePermanently}
    >
     <Trash2 className="size-4" />
     Delete permanently
    </DropdownMenuItem>
   </DropdownMenuContent>
  </DropdownMenu>
 )
}

const columns = [
  columnHelper.accessor('title', {
   header: () => <SortButton label="Title" asc="title_asc" desc="title_desc" />,
   cell: ({ getValue }) => (
    <span className="font-medium truncate block max-w-[200px] lg:max-w-xs">{getValue() || 'Untitled'}</span>
   ),
  }),
 columnHelper.accessor('visibility', {
  header: 'Visibility',
  cell: ({ getValue }) => {
   const value = getValue()
   return (
    <Badge variant={value === 'PUBLIC' ? 'default' : 'secondary'}>
     {value.charAt(0) + value.slice(1).toLowerCase()}
    </Badge>
   )
  },
 }),
 columnHelper.accessor('deletedAt', {
  header: () => (
   <SortButton label="Deleted At" asc="updated_asc" desc="updated_desc" />
  ),
  cell: ({ getValue }) => (
   <div>{getValue() ? formatRelative(getValue()!, new Date()) : '—'}</div>
  ),
 }),
 columnHelper.display({
  id: 'actions',
  cell: ({ row }) => (
   <div className="flex justify-end">
    <ActionsMenu row={row} />
   </div>
  ),
 }),
]

function DocumentCard({
 row,
}: {
 row: Row<DocumentRow>
}) {
 const { title, visibility, id } = row.original
 const { handleRestore, handleDeletePermanently, isRestoring } =
  useTrashActions(id)

 return (
  <div
   className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-foreground/20 hover:-translate-y-0.5"
  >
   <div className="flex items-start justify-between gap-2">
    <Badge
     variant={visibility === 'PUBLIC' ? 'default' : 'secondary'}
     className="shrink-0"
    >
     {visibility.charAt(0) + visibility.slice(1).toLowerCase()}
    </Badge>
    <DropdownMenu>
     <DropdownMenuTrigger
      render={
       <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mr-1 -mt-1"
        onClick={(e) => e.stopPropagation()}
       />
      }
     >
      <MoreHorizontal className="size-3.5" />
     </DropdownMenuTrigger>
     <DropdownMenuContent align="end">
      <DropdownMenuItem disabled={isRestoring} onClick={handleRestore}>
       <RotateCcw className="size-4" />
       Restore
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
       className="text-destructive focus:text-destructive"
       onClick={handleDeletePermanently}
      >
       <Trash2 className="size-4" />
       Delete permanently
      </DropdownMenuItem>
     </DropdownMenuContent>
    </DropdownMenu>
   </div>

   <p className="font-medium text-sm leading-snug line-clamp-2 flex-1">
    {title || 'Untitled'}
   </p>
  </div>
 )
}

function GridSkeleton({ count = 6 }: { count?: number }) {
 return (
  <>
   {Array.from({ length: count }).map((_, i) => (
    <div key={i} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
     <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-16 rounded-full" />
     </div>
     <Skeleton className="h-4 w-3/4" />
     <Skeleton className="h-3.5 w-1/2" />
     <div className="flex items-center justify-between pt-1 border-t border-border/60">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-3.5 w-20" />
     </div>
    </div>
   ))}
  </>
 )
}

export default function Trash() {
 const router = useRouter()
 const [sorting, setSorting] = useState<SortingState>([])
 const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

 const { data, isLoading } = useQuery(
  orpc.documents.getTrashedDocuments.queryOptions({
   input: {
    query: { page: pagination.pageIndex + 1, limit: pagination.pageSize },
   },
   placeholderData: keepPreviousData,
  })
 )

 const { setMaxPages, maxPages, searchTerm, view, activeFilters, sortBy } =
  useDashboard(
   useShallow((state) => ({
    setMaxPages: state.setMaxPages,
    maxPages: state.trash.maxPages,
    searchTerm: state.trash.searchTerm,
    view: state.trash.view,
    activeFilters: state.trash.activeFilters,
    sortBy: state.trash.sortBy,
   }))
  )

 if (data) {
  const maxPages = Math.ceil(
   Number(data?.data[0]?.totalDocuments ?? 0) / Number(data.limit ?? 0)
  )
  setMaxPages('trash', isNaN(maxPages) ? 1 : maxPages)
 }

 const [debouncedSearch] = useDebounce(searchTerm, 500)

 const localResults = useMemo(() => {
  if (!debouncedSearch || !data?.data) return data?.data ?? []
  const fuse = new Fuse(data.data, {
   keys: ['title'],
   includeScore: true,
   isCaseSensitive: false,
   threshold: 0.3,
  })
  return fuse.search(debouncedSearch).map((r) => r.item)
 }, [debouncedSearch, data?.data])

 const {
  data: serverResults,
  isLoading: isServerSearching,
  isRefetching: isServerSearchRefetching,
  isError: isServerError,
 } = useQuery(
  orpc.documents.searchDocument.queryOptions({
   input: {
    body: { title: debouncedSearch, isDeleted: true },
    query: { page: pagination.pageIndex + 1, limit: pagination.pageSize },
   },
   enabled: !!debouncedSearch,
   placeholderData: keepPreviousData,
  })
 )

 const mergedResults = useMemo(() => {
  const serverData = serverResults?.data ?? []
  const combined = debouncedSearch
   ? [...localResults, ...serverData]
   : (data?.data ?? [])

  return Array.from(
   new Map(
    combined
     .filter((d) => d.id != null)
     .map((d) => [String(d.id), d] as const)
     .filter(([, doc]) => {
      if (activeFilters.length === 0) return true
      return activeFilters.every((filter) => {
       switch (filter.type) {
        case 'visibility':
         return doc.visibility === filter.value
        case 'date': {
         const updated = doc.updatedAt ? new Date(doc.updatedAt) : null
         if (!updated) return false
         const now = new Date()
         const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
         )
         const startOfWeek = new Date(startOfDay)
         startOfWeek.setDate(startOfDay.getDate() - now.getDay())
         const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
         switch (filter.value) {
          case 'today':
           return updated >= startOfDay
          case 'this_week':
           return updated >= startOfWeek
          case 'this_month':
           return updated >= startOfMonth
          case 'older':
           return updated < startOfMonth
         }
        }
        // eslint-disable-next-line no-fallthrough
        default:
         return true
       }
      })
     })
     .sort(([, a], [, b]) => {
      switch (sortBy) {
       case 'updated_desc':
        return (
         new Date(b.deletedAt ?? 0).getTime() -
         new Date(a.deletedAt ?? 0).getTime()
        )
       case 'updated_asc':
        return (
         new Date(a.deletedAt ?? 0).getTime() -
         new Date(b.deletedAt ?? 0).getTime()
        )
       case 'title_asc':
        return (a.title ?? '').localeCompare(b.title ?? '')
       case 'title_desc':
        return (b.title ?? '').localeCompare(a.title ?? '')
       default:
        return 0
      }
     })
   ).values()
  )
 }, [
  debouncedSearch,
  localResults,
  serverResults,
  data?.data,
  activeFilters,
  sortBy,
 ])

 useEffect(() => {
  if (debouncedSearch) setPagination((prev) => ({ ...prev, pageIndex: 0 }))
 }, [debouncedSearch])

 const table = useReactTable({
  data: (mergedResults as any) ?? [],
  columns,
  state: { sorting, pagination },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  manualPagination: true,
  manualFiltering: true,
  onPaginationChange: setPagination,
  pageCount: debouncedSearch
   ? Math.ceil(
      Number(serverResults?.data[0]?.totalDocuments ?? 0) / pagination.pageSize
     )
   : maxPages,
 })

 const isSearchPending = isServerSearching || isServerSearchRefetching
 const rows = table.getRowModel().rows

 return (
  <DashboardShell
   title="Trash"
   pageName="trash"
   selector={(state) => state.trash}
   getPrevPage={table.previousPage}
   getNextPage={table.nextPage}
   pageCount={table.getPageCount}
   onSetActiveFilters={(f: DocumentFilter[]) =>
    useDashboard.getState().setActiveFilters('trash', f)
   }
   onToggleFilter={(f) => useDashboard.getState().toggleFilter('trash', f)}
   onClearFilters={() => useDashboard.getState().setActiveFilters('trash', [])}
   onSortChange={(s) => useDashboard.getState().setSortBy('trash', s)}
  >
{view === 'list' && (
     <div className="rounded-xl border mt-2 overflow-x-auto">
      <Table>
      <TableHeader>
       {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="hover:bg-transparent">
         {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
           {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
         ))}
        </TableRow>
       ))}
      </TableHeader>
      <TableBody>
       {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
         <TableRow key={i}>
          {columns.map((_, j) => (
           <TableCell key={j}>
            <Skeleton className="h-4 w-full" />
           </TableCell>
          ))}
         </TableRow>
        ))
       ) : rows.length ? (
        rows.map((row) => (
         <TableRow
          key={row.id}
         >
          {row.getVisibleCells().map((cell) => (
           <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
           </TableCell>
          ))}
         </TableRow>
        ))
       ) : isSearchPending ? (
        Array.from({ length: 3 }).map((_, i) => (
         <TableRow key={i}>
          {columns.map((_, j) => (
           <TableCell key={j}>
            <Skeleton className="h-4 w-full" />
           </TableCell>
          ))}
         </TableRow>
        ))
       ) : (
        <TableRow>
         <TableCell
          colSpan={columns.length}
          className="h-32 text-center text-muted-foreground"
         >
          {searchTerm ? (
           <span>
            Could not find any <strong>deleted</strong> documents with that
            title
           </span>
          ) : (
           'Nothing in trash'
          )}
         </TableCell>
        </TableRow>
       )}
       {rows.length > 0 &&
        isSearchPending &&
        Array.from({ length: 3 }).map((_, i) => (
         <TableRow key={`skel-${i}`}>
          {columns.map((_, j) => (
           <TableCell key={j}>
            <Skeleton className="h-4 w-full" />
           </TableCell>
          ))}
         </TableRow>
        ))}
       {isServerError && mergedResults.length > 0 && (
        <TableRow>
         <TableCell
          colSpan={columns.length}
          className="text-center text-muted-foreground"
         >
          Local results shown. Some results may still exist on the server.
         </TableCell>
        </TableRow>
       )}
      </TableBody>
     </Table>
    </div>
   )}

   {view === 'grid' && (
    <div className="mt-2">
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {isLoading ? (
       <GridSkeleton count={8} />
      ) : rows.length ? (
       <>
        {rows.map((row) => (
         <DocumentCard
          key={row.id}
          row={row}
         />
        ))}
        {isSearchPending && <GridSkeleton count={3} />}
       </>
      ) : isSearchPending ? (
       <GridSkeleton count={6} />
      ) : (
       <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground text-sm">
        {searchTerm
         ? 'Could not find any documents with that title'
         : 'Nothing in trash'}
       </div>
      )}
     </div>
     {isServerError && mergedResults.length > 0 && (
      <p className="mt-3 text-center text-xs text-muted-foreground">
       Local results shown. Some results may still exist on the server.
      </p>
     )}
    </div>
   )}
  </DashboardShell>
 )
}
