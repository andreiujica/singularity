"use client"

import { ConversationGroup } from "@/hooks/use-conversation-groups"
import { getConversationPreview } from "@/utils/conversation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@workspace/ui/components/sidebar"

interface ConversationGroupProps {
  group: ConversationGroup
  currentConversationId: string | null
  isLoading: boolean
  onSelectConversation: (id: string) => void
}

export function ConversationGroupComponent({
  group,
  currentConversationId,
  isLoading,
  onSelectConversation
}: ConversationGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((conversation) => (
            <SidebarMenuItem key={conversation.id} data-testid="conversation-item">
              <SidebarMenuButton 
                isActive={conversation.id === currentConversationId}
                onClick={() => onSelectConversation(conversation.id)}
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
  )
} 