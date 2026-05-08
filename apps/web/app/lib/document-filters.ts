import { isToday, isThisWeek, isThisMonth, isBefore, subMonths } from 'date-fns'
import type { DocumentFilter, SortOption } from '@/providers/dashboard.store'

type Document = {
 id: string
 title: string
 visibility: 'PUBLIC' | 'PRIVATE'
 collaborators: { id: string; name: string; image: string | null }[]
 commentsCount: number
 updatedAt: Date | string
}

export function applyFilters<T extends Document>(
 docs: T[],
 filters: DocumentFilter[]
): T[] {
 return docs.filter((doc) =>
  filters.every((filter) => {
   switch (filter.type) {
    case 'visibility':
     return doc.visibility === filter.value

    case 'collaborators':
     return filter.value === 'shared'
      ? doc.collaborators.length > 0
      : doc.collaborators.length === 0

    case 'date': {
     const date = new Date(doc.updatedAt)
     switch (filter.value) {
      case 'today':
       return isToday(date)
      case 'this_week':
       return isThisWeek(date, { weekStartsOn: 1 })
      case 'this_month':
       return isThisMonth(date)
      case 'older':
       return isBefore(date, subMonths(new Date(), 1))
     }
    }

    case 'comments':
     return doc.commentsCount > 0

    default:
     return true
   }
  })
 )
}

export function applySort<T extends Document>(
 docs: T[],
 sortBy: SortOption
): T[] {
 return [...docs].sort((a, b) => {
  switch (sortBy) {
   case 'updated_desc':
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
   case 'updated_asc':
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
   case 'title_asc':
    return (a.title || '').localeCompare(b.title || '')
   case 'title_desc':
    return (b.title || '').localeCompare(a.title || '')
   case 'most_comments':
    return b.commentsCount - a.commentsCount
  }
 })
}
