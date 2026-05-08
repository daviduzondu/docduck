import { Button } from "@/components/ui/button"
import useDashboard, { SortOption } from "@/providers/dashboard.store"
import { ArrowUpDown } from "lucide-react"

export const SortButton = ({
  label,
  asc,
  desc,
}: {
  label: string
  asc: SortOption
  desc?: SortOption
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="-ml-3"
    onClick={() => {
      const sortBy = useDashboard.getState().documents.sortBy
      useDashboard.getState().setSortBy('documents', sortBy === asc && desc ? desc : asc)
    }}
  >
    {label}
    <ArrowUpDown className="size-3.5" />
  </Button>
)