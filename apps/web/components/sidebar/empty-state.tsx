"use client"

import { sidebar } from "@/constants/ui-text"

interface EmptyStateProps {
  hasSearchQuery: boolean
}

export function EmptyState({ hasSearchQuery }: EmptyStateProps) {
  return (
    <div className="px-3 py-2 text-sm text-muted-foreground">
      {hasSearchQuery ? sidebar.emptySearch : sidebar.emptyConversations}
    </div>
  )
} 