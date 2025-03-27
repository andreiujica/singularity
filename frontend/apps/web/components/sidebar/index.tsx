"use client"

import * as React from "react"
import { useMemo } from "react"
import { useChatContext } from "@/hooks/useChatContext"
import { SearchForm } from "@/components/sidebar/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { SidebarLogo } from "@/components/sidebar/logo"
import { formatDistanceToNow } from "date-fns"
import { Conversation } from "@/types/chat"

type ConversationGroup = {
  title: string;
  items: Conversation[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { conversations, currentConversationId, switchConversation } = useChatContext()
  
  // Group conversations by date
  const groupedConversations = useMemo(() => {
    // Sort conversations by updatedAt (newest first)
    const sortedConversations = [...conversations].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    
    // Create groups
    const todayGroup: Conversation[] = [];
    const yesterdayGroup: Conversation[] = [];
    const thisWeekGroup: Conversation[] = [];
    const olderGroup: Conversation[] = [];
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    // Sort conversations into groups
    sortedConversations.forEach(conversation => {
      const updatedAt = new Date(conversation.updatedAt)
      updatedAt.setHours(0, 0, 0, 0)
      
      if (updatedAt.getTime() === today.getTime()) {
        todayGroup.push(conversation)
      } else if (updatedAt.getTime() === yesterday.getTime()) {
        yesterdayGroup.push(conversation)
      } else if (updatedAt.getTime() >= oneWeekAgo.getTime()) {
        thisWeekGroup.push(conversation)
      } else {
        olderGroup.push(conversation)
      }
    })
    
    // Create the groups array
    const result: ConversationGroup[] = [];
    
    if (todayGroup.length > 0) {
      result.push({ title: "Today", items: todayGroup });
    }
    
    if (yesterdayGroup.length > 0) {
      result.push({ title: "Yesterday", items: yesterdayGroup });
    }
    
    if (thisWeekGroup.length > 0) {
      result.push({ title: "This Week", items: thisWeekGroup });
    }
    
    if (olderGroup.length > 0) {
      result.push({ title: "Older", items: olderGroup });
    }
    
    return result;
  }, [conversations])
  
  // Get the first message content preview (or use the title as fallback)
  const getConversationPreview = (conversation: Conversation) => {
    if (conversation.messages.length > 0) {
      const firstMessage = conversation.messages[0]
      if (firstMessage) {
        // Truncate the message to a reasonable length
        const preview = firstMessage.content.substring(0, 50)
        return preview.length < firstMessage.content.length 
          ? `${preview}...` 
          : preview
      }
    }
    return conversation.title
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-col gap-4">
        <SidebarLogo />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* Show message if no conversations */}
        {groupedConversations.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No conversations yet. Start a new chat to begin.
          </div>
        )}
        
        {/* Render grouped conversations */}
        {groupedConversations.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton 
                      isActive={conversation.id === currentConversationId}
                      onClick={() => switchConversation(conversation.id)}
                    >
                      {getConversationPreview(conversation)}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
