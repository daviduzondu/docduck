'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type {
  CollaboratorFilter,
  DateFilter,
  DocumentFilter,
  SortOption,
  VisibilityFilter,
} from '@/providers/dashboard.store'
import { Filter, X } from 'lucide-react'

type Props = {
  activeFilters: DocumentFilter[]
  sortBy: SortOption
  onToggleFilter: (filter: DocumentFilter) => void
  onClearFilters: () => void
  onSortChange: (sort: SortOption) => void
  onSetActiveFilters: (filter: DocumentFilter[]) => void
}

function getActiveValueForType<T extends DocumentFilter['type']>(
  filters: DocumentFilter[],
  type: T
): Extract<DocumentFilter, { type: T }>['value'] | undefined {
  return (
    filters.find((f) => f.type === type) as
      | Extract<DocumentFilter, { type: T }>
      | undefined
  )?.value
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'updated_desc', label: 'Last updated' },
  { value: 'updated_asc', label: 'Oldest first' },
  { value: 'title_asc', label: 'Title A → Z' },
  { value: 'title_desc', label: 'Title Z → A' },
]

export function DocumentFilterPopover({
  activeFilters,
  onToggleFilter,
  onClearFilters,
  onSetActiveFilters,
}: Props) {
  const activeCount = activeFilters.length
  const activeVisibility = getActiveValueForType(activeFilters, 'visibility')
  const activeCollaborator = getActiveValueForType(activeFilters, 'collaborators')
  const activeDate = getActiveValueForType(activeFilters, 'date')

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full shrink-0 gap-1.5"
          >
            <Filter className="size-3.5" />
            Filters
            {activeCount > 0 && (
              <Badge className="rounded-full p-2 flex items-center justify-center  leading-none">
                {activeCount}
              </Badge>
            )}
          </Button>
        }
      />

      <PopoverContent align="start" className="w-fit p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filters</p>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground gap-1"
              onClick={onClearFilters}
            >
              <X className="size-3" />
              Clear all
            </Button>
          )}
        </div>

        <Separator />

        {/* Visibility */}
        <Section label="Visibility">
          <ToggleGroup
            variant="outline"
            size="sm"
            className="justify-start flex-wrap"
            value={activeVisibility ? [activeVisibility] : []}
            onValueChange={(v) => {
              if (!v[0]) {
                onSetActiveFilters(activeFilters.filter((f) => f.type !== 'visibility'))
                return
              }
              onToggleFilter({ type: 'visibility', value: v[0] as VisibilityFilter })
            }}
          >
            <ToggleGroupItem value="PUBLIC">Public</ToggleGroupItem>
            <ToggleGroupItem value="PRIVATE">Private</ToggleGroupItem>
          </ToggleGroup>
        </Section>

        {/* Collaborators */}
        <Section label="Collaborators">
          <ToggleGroup
            variant="outline"
            size="sm"
            className="justify-start"
            value={activeCollaborator ? [activeCollaborator] : []}
            onValueChange={(v) => {
              if (!v[0]) {
                onSetActiveFilters(activeFilters.filter((f) => f.type !== 'collaborators'))
                return
              }
              onToggleFilter({ type: 'collaborators', value: v[0] as CollaboratorFilter })
            }}
          >
            <ToggleGroupItem value="shared">Shared</ToggleGroupItem>
            <ToggleGroupItem value="solo">Solo</ToggleGroupItem>
          </ToggleGroup>
        </Section>

        {/* Date */}
        <Section label="Last updated">
          <ToggleGroup
            variant="outline"
            size="sm"
            className="justify-start flex-wrap"
            value={activeDate ? [activeDate] : []}
            onValueChange={(v) => {
              if (!v[0]) {
                onSetActiveFilters(activeFilters.filter((f) => f.type !== 'date'))
                return
              }
              onToggleFilter({ type: 'date', value: v[0] as DateFilter })
            }}
          >
            <ToggleGroupItem value="today">Today</ToggleGroupItem>
            <ToggleGroupItem value="this_week">This week</ToggleGroupItem>
            <ToggleGroupItem value="this_month">This month</ToggleGroupItem>
            <ToggleGroupItem value="older">Older</ToggleGroupItem>
          </ToggleGroup>
        </Section>

        {/* Comments */}
        {/* <Section label="Comments">
          <Toggle
            variant="outline"
            size="sm"
            pressed={hasComments}
            onPressedChange={() =>
              onToggleFilter({ type: 'comments', value: 'has_comments' })
            }
            className="justify-start w-fit"
          >
            Has comments
          </Toggle>
        </Section> */}
      </PopoverContent>
    </Popover>
  )
}