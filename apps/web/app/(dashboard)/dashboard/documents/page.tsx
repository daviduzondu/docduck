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
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import {
 createColumnHelper,
 flexRender,
 getCoreRowModel,
 getFilteredRowModel,
 getPaginationRowModel,
 getSortedRowModel,
 useReactTable,
 type SortingState,
} from '@tanstack/react-table'
import { formatRelative } from 'date-fns'
import {
 ArrowUpDown,
 Loader,
 Loader2,
 MessageSquare,
 MoreHorizontal,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import useDashboard from '@/providers/dashboard.store'
import { useShallow } from 'zustand/react/shallow'
import { InferClientOutputs } from '@orpc/client'
import { useDebounce } from 'use-debounce'

const columnHelper =
 createColumnHelper<
  Awaited<ReturnType<typeof $api.documents.getDocuments>>['data'][number]
 >()

const columns = [
 columnHelper.accessor('title', {
  header: ({ column }) => (
   <Button
    variant="ghost"
    size="sm"
    className="-ml-3"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
   >
    Title
    <ArrowUpDown className="size-3.5" />
   </Button>
  ),
  cell: ({ getValue }) => (
   <span className="font-medium">{getValue() || 'Untitled'}</span>
  ),
  enableColumnFilter: true,
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
  enableColumnFilter: false,
 }),
 columnHelper.accessor('collaborators', {
  header: 'Collaborators',
  cell: ({ getValue }) => {
   const collaborators = getValue()
   return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
     {/* <Users className="size-3.5 shrink-0" /> */}
     {collaborators.length > 0 ? (
      <AvatarGroup>
       {collaborators.slice(0, 2).map((collaborator) => (
        <Avatar key={collaborator.id} size="sm">
         <AvatarImage
          src={collaborator.image ?? undefined}
          alt={collaborator.name}
         />
         <AvatarFallback
          className={'text-background'}
          style={{ background: getUserColor(collaborator.id) }}
         >
          {collaborator.name[0]}
         </AvatarFallback>
        </Avatar>
       ))}
       {collaborators.length > 2 ? (
        <AvatarGroupCount className="text-sm">
         +{collaborators.slice(2).length}
        </AvatarGroupCount>
       ) : null}
      </AvatarGroup>
     ) : (
      'No collaborators'
     )}
    </div>
   )
  },
  enableColumnFilter: false,
 }),
 columnHelper.accessor('commentsCount', {
  header: 'Comments',
  cell: ({ getValue }) => (
   <div className="flex items-center gap-1.5 text-muted-foreground">
    <MessageSquare className="size-3.5 shrink-0" />
    <span className="text-sm">{getValue()}</span>
   </div>
  ),
  enableColumnFilter: false,
 }),
 columnHelper.accessor('updatedAt', {
  header: 'Last Updated',
  cell: ({ getValue }) => <div>{formatRelative(getValue(), new Date())}</div>,
  enableColumnFilter: false,
 }),
 columnHelper.display({
  id: 'actions',
  cell: () => (
   <div className="flex justify-end">
    <Button variant="ghost" size="icon" className="size-8">
     <MoreHorizontal className="size-4" />
    </Button>
   </div>
  ),
  enableColumnFilter: false,
 }),
]

export default function Documents() {
 const router = useRouter()
 const [sorting, setSorting] = useState<SortingState>([])
 const [pagination, setPagination] = useState({
  pageIndex: 0, //initial page index
  pageSize: 10, //default page size
 })
 const { data, isLoading } = useQuery(
  orpc.documents.getDocuments.queryOptions({
   input: {
    query: {
     page: pagination.pageIndex + 1,
     limit: pagination.pageSize,
    },
   },
   placeholderData: keepPreviousData,
  })
 )
 const { setMaxPages, maxPages, searchTerm } = useDashboard(
  useShallow((state) => ({
   setMaxPages: state.setMaxPages,
   maxPages: state.documents.maxPages,
   searchTerm: state.documents.searchTerm,
  }))
 )
 if (data) {
  const maxPages = Math.ceil(
   Number(data?.data[0]?.totalDocuments ?? 0) / Number(data.data[0]?.limit ?? 0)
  )
  setMaxPages('documents', isNaN(maxPages) ? 1 : maxPages)
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
    body: { title: debouncedSearch },
    query: {
     page: pagination.pageIndex + 1,
     limit: pagination.pageSize,
    },
   },
   enabled: !!debouncedSearch,
   placeholderData: keepPreviousData,
  })
 )

 const mergedResults = useMemo(() => {
  if (!debouncedSearch) return data?.data ?? []
  const serverData =
   serverResults?.data ?? []
  const combined = [...localResults, ...serverData]

  return Array.from(
   new Map(combined.map((doc) => [doc.id, doc])).entries()
  ).map(([, doc]) => doc)
 }, [debouncedSearch, localResults, serverResults, data?.data])

 useEffect(() => {
  if (debouncedSearch) {
   setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }
 }, [debouncedSearch])

 const table = useReactTable({
  data: (mergedResults as any) ?? [],
  columns,
  state: { sorting, pagination },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  manualPagination: true,
  manualFiltering: true,
  onPaginationChange: setPagination,
  // pageCount: debouncedSearch ? 1 : maxPages,
  pageCount: debouncedSearch
   ? Math.ceil(
      Number(serverResults?.data[0]?.totalDocuments ?? 0) / pagination.pageSize
     )
   : maxPages,
 })

 return (
  <DashboardShell
   title="My Documents"
   pageName="documents"
   selector={(state) => state.documents}
   //    handleSearch={handleSearch}
   getPrevPage={table.previousPage}
   getNextPage={table.nextPage}
   pageCount={table.getPageCount}
  >
   <>
    <div className="rounded-xl border mt-4 overflow-hidden">
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
       ) : table.getRowModel().rows.length ? (
        table.getRowModel().rows.map((row) => (
         <TableRow
          key={row.id}
          className="cursor-pointer"
          onClick={() => router.push('/doc/' + row.original.id)}
         >
          {row.getVisibleCells().map((cell) => (
           <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
           </TableCell>
          ))}
         </TableRow>
        ))
       ) : isServerSearching || isServerSearchRefetching ? (
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
          {searchTerm
           ? 'Could not find any documents with that title'
           : 'No documents yet.'}
         </TableCell>
        </TableRow>
       )}
       {/* Only append server skeletons below existing local rows */}
       {table.getRowModel().rows.length > 0 &&
       (isServerSearching || isServerSearchRefetching)
        ? Array.from({ length: 3 }).map((_, i) => (
           <TableRow key={i}>
            {columns.map((_, j) => (
             <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
             </TableCell>
            ))}
           </TableRow>
          ))
        : null}
       {isServerError && mergedResults.length > 0 ? (
        <TableRow>
         <TableCell
          colSpan={columns.length}
          className="text-center text-muted-foreground"
         >
          Local results shown. Some results may still exist on the server.
         </TableCell>
        </TableRow>
       ) : null}
      </TableBody>
     </Table>
    </div>
   </>
  </DashboardShell>
 )
}
