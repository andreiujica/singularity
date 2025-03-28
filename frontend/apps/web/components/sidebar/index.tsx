"use client"

import * as React from "react"
import { useMemo, useState } from "react"
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
  const { conversations, currentConversationId, switchConversation, isLoading } = useChatContext()
  const [searchQuery, setSearchQuery] = useState("");

  // Handler for switching conversations that checks loading state
  const handleSwitchConversation = (conversationId: string) => {
    if (isLoading) return; // Don't allow switching during loading
    switchConversation(conversationId);
  };

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    // Filter conversations based on search query
    const filteredConversations = searchQuery.trim() !== "" 
      ? conversations.filter(conv => {
          // Search in title
          if (conv.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return true;
          }
          
          // Search in message content
          return conv.messages.some(msg => 
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
      : conversations;
    
    // Group filtered conversations
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const thisWeek: Conversation[] = [];
    const thisMonth: Conversation[] = [];
    const older: Conversation[] = [];
    
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const thisWeekDate = new Date(todayDate);
    thisWeekDate.setDate(thisWeekDate.getDate() - 7);
    const thisMonthDate = new Date(todayDate);
    thisMonthDate.setDate(thisMonthDate.getDate() - 30);
    
    filteredConversations.forEach(conversation => {
      const convDate = new Date(conversation.updatedAt);
      if (convDate >= todayDate) {
        today.push(conversation);
      } else if (convDate >= yesterdayDate) {
        yesterday.push(conversation);
      } else if (convDate >= thisWeekDate) {
        thisWeek.push(conversation);
      } else if (convDate >= thisMonthDate) {
        thisMonth.push(conversation);
      } else {
        older.push(conversation);
      }
    });
    
    const groups: ConversationGroup[] = [];
    
    if (today.length > 0) {
      groups.push({ title: 'Today', items: today.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) });
    }
    
    if (yesterday.length > 0) {
      groups.push({ title: 'Yesterday', items: yesterday.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) });
    }
    
    if (thisWeek.length > 0) {
      groups.push({ title: 'This Week', items: thisWeek.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) });
    }
    
    if (thisMonth.length > 0) {
      groups.push({ title: 'This Month', items: thisMonth.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) });
    }
    
    if (older.length > 0) {
      groups.push({ title: 'Older', items: older.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) });
    }
    
    return groups;
  }, [conversations, searchQuery]);
  
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
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          disabled={isLoading}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* Show message if no conversations */}
        {groupedConversations.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {searchQuery.trim() !== "" 
              ? "No conversations found for your search. Try a different term."
              : "No conversations yet. Start a new chat to begin."}
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
                      onClick={() => handleSwitchConversation(conversation.id)}
                      disabled={isLoading}
                      className={isLoading && conversation.id !== currentConversationId ? "opacity-50 cursor-not-allowed" : ""}
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
