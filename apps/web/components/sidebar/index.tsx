"use client"

import * as React from "react"
import { useState } from "react"
import { useChatContext } from "@/hooks/useChatContext"
import { useConversationGroups } from "@/hooks/use-conversation-groups"
import { SearchForm } from "@/components/sidebar/search-form"
import { ConversationGroupComponent } from "@/components/sidebar/conversation-group"
import { EmptyState } from "@/components/sidebar/empty-state"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { SidebarLogo } from "@/components/sidebar/logo"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { conversations, currentConversationId, switchConversation, isLoading } = useChatContext()
  const [searchQuery, setSearchQuery] = useState("")

  // Handler for switching conversations that checks loading state
  const handleSwitchConversation = (conversationId: string) => {
    if (isLoading) return // Don't allow switching during loading
    switchConversation(conversationId)
  }

  // Use our custom hook to get grouped conversations
  const groupedConversations = useConversationGroups(conversations, searchQuery)

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-col gap-4">
        <SidebarLogo />
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          disabled={isLoading}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* Show message if no conversations */}
        {groupedConversations.length === 0 && (
          <EmptyState hasSearchQuery={searchQuery.trim() !== ""} />
        )}
        
        {/* Render grouped conversations */}
        {groupedConversations.map((group) => (
          <ConversationGroupComponent
            key={group.title}
            group={group}
            currentConversationId={currentConversationId}
            isLoading={isLoading}
            onSelectConversation={handleSwitchConversation}
          />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
