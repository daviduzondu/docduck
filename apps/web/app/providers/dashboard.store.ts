import { create } from 'zustand'

export type VisibilityFilter = 'PUBLIC' | 'PRIVATE'
export type CollaboratorFilter = 'shared' | 'solo'
export type DateFilter = 'today' | 'this_week' | 'this_month' | 'older'
export type CommentFilter = 'has_comments'

export type DocumentFilter =
 | { type: 'visibility'; value: VisibilityFilter }
 | { type: 'collaborators'; value: CollaboratorFilter }
 | { type: 'date'; value: DateFilter }
 | { type: 'comments'; value: CommentFilter }

export type SortOption =
 | 'updated_desc'
 | 'updated_asc'
 | 'title_asc'
 | 'title_desc'
 | 'comments_asc'
 | 'comments_desc'

export type DashboardState = {
 documents: {
  searchTerm: string
  activeFilters: DocumentFilter[]
  sortBy: SortOption
  currentPage: number
  maxPages: number | undefined
  view: 'grid' | 'list'
 }

 trash: {
  searchTerm: string
  activeFilters: DocumentFilter[]
  currentPage: number
  maxPages: number | undefined
  view: 'grid' | 'list'
  sortBy: SortOption
 }
}

export type DashboardStoreActions = {
 setSearchTerm: (page: keyof DashboardState, searchTerm: string) => void
 setActiveFilters: (
  page: keyof DashboardState,
  filters: DocumentFilter[]
 ) => void
 toggleFilter: (page: keyof DashboardState, filter: DocumentFilter) => void
 setSortBy: (page: keyof DashboardState, sort: SortOption) => void
 setCurrentPage: (page: keyof DashboardState, pageNumber: number) => void
 setView: (page: keyof DashboardState, view: 'grid' | 'list') => void
 setMaxPages: (page: keyof DashboardState, size: number) => void
}

export type DashboardStore = DashboardState & DashboardStoreActions

const useDashboard = create<DashboardStore>((set) => ({
 documents: {
  searchTerm: '',
  activeFilters: [],
  sortBy: 'updated_desc',
  currentPage: 1,
  maxPages: undefined,
  view: 'list',
 },
 trash: {
  searchTerm: '',
  activeFilters: [],
  sortBy: 'updated_desc',
  currentPage: 1,
  maxPages: undefined,
  view: 'list',
 },

 setSearchTerm: (page, searchTerm) =>
  set((state) => ({ [page]: { ...state[page], searchTerm } })),

 setActiveFilters: (page, activeFilters) =>
  set((state) => ({ [page]: { ...state[page], activeFilters } })),

 // Toggles a filter on/off. For mutually exclusive types (visibility, date,
 // collaborators) it replaces the existing one; for additive types (comments)
 // it toggles on/off.
 toggleFilter: (page, filter) =>
  set((state) => {
   const current: DocumentFilter[] = state[page].activeFilters
   const isSameFilter = (a: DocumentFilter, b: DocumentFilter) =>
    a.type === b.type && a.value === b.value

   // If already active, remove it
   if (current.some((f) => isSameFilter(f, filter))) {
    return {
     [page]: {
      ...state[page],
      activeFilters: current.filter((f) => !isSameFilter(f, filter)),
     },
    }
   }

   // Remove any existing filter of the same type, then add the new one
   const withoutSameType = current.filter((f) => f.type !== filter.type)
   return {
    [page]: { ...state[page], activeFilters: [...withoutSameType, filter] },
   }
  }),

 setSortBy: (page, sortBy) =>
  set((state) => ({ [page]: { ...state[page], sortBy } })),

 setCurrentPage: (page, currentPage) =>
  set((state) => ({ [page]: { ...state[page], currentPage } })),

 setView: (page, view) =>
  set((state) => ({ [page]: { ...state[page], view } })),

 setMaxPages: (page, size) =>
  set((state) => ({ [page]: { ...state[page], maxPages: size } })),
}))

export default useDashboard
