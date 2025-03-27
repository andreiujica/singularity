import { Search } from "lucide-react"

import { Label } from "@workspace/ui/components/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@workspace/ui/components/sidebar"

interface SearchFormProps extends React.ComponentProps<"form"> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchForm({ searchQuery, setSearchQuery, ...props }: SearchFormProps) {
  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search your chats..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
