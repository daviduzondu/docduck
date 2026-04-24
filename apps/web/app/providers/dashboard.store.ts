import { create } from 'zustand'

const useDashboard = create<DashboardStore>((set) => ({
 documents: {
  searchTerm: '',
  activeFilters: [],
  currentPage: 1,
  view: 'list',
 },
 setSearchTerm: (page, searchTerm) =>
  set((state) => ({ [page]: { ...state[page], searchTerm } })),
 setActiveFilters: (page, activeFilters) =>
  set((state) => ({ [page]: { ...state[page], activeFilters } })),
 setCurrentPage: (page, currentPage) =>
  set((state) => ({ [page]: { ...state[page], currentPage } })),
 setView: (page, view) =>
  set((state) => ({ [page]: { ...state[page], view } })),
}))

export type DashboardStore = DashboardState & DashboardStoreActions;

export type DashboardState = {
 documents: {
  searchTerm: string
  activeFilters: string[]
  currentPage: number
  view: 'grid' | 'list'
 }
}
export type DashboardStoreActions = {
 setSearchTerm: (page: keyof DashboardStore, searchTerm: string) => void
 setActiveFilters: (page: keyof DashboardStore, filters: string[]) => void
 setCurrentPage: (page: keyof DashboardStore, pageNumber: number) => void
 setView: (page: keyof DashboardStore, view: 'grid' | 'list') => void
}

export default useDashboard
