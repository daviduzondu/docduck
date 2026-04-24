'use client'

import DashboardShell from '@/components/dashboard/dashboard-shell'
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
import { orpc } from '@/lib/orpc.client'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, MessageSquare, MoreHorizontal, Users } from 'lucide-react'
import { useState } from 'react'

type Document = {
  id: string
  title: string
  visibility: 'PRIVATE' | 'PUBLIC'
  collaborators: { id: string; name: string }[]
  commentsCount: number
  yjsState: undefined
}

const columnHelper = createColumnHelper<Document>()

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
  columnHelper.accessor('collaborators', {
    header: 'Collaborators',
    cell: ({ getValue }) => {
      const collaborators = getValue()
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-3.5 shrink-0" />
          <span className="text-sm">{collaborators.length}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor('commentsCount', {
    header: 'Comments',
    cell: ({ getValue }) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MessageSquare className="size-3.5 shrink-0" />
        <span className="text-sm">{getValue()}</span>
      </div>
    ),
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
  }),
]

export default function Documents() {
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading } = useQuery(
    orpc.documents.getDocuments.queryOptions({ input: {} })
  )

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DashboardShell title="My Documents">
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
                  onClick={() => {
                    // navigate to document
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No documents yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  )
}