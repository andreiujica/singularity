import { useMemo } from "react"
import { Conversation } from "@/types/chat"

export interface ConversationGroup {
  title: string
  items: Conversation[]
}

export function useConversationGroups(
  conversations: Conversation[],
  searchQuery: string
): ConversationGroup[] {
  return useMemo(() => {
    // Filter conversations based on search query
    const filteredConversations = searchQuery.trim() !== "" 
      ? conversations.filter(conv => {
          // Search in title
          if (conv.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return true
          }
          
          // Search in message content
          return conv.messages.some(msg => 
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })
      : conversations
    
    // Group filtered conversations
    const today: Conversation[] = []
    const yesterday: Conversation[] = []
    const thisWeek: Conversation[] = []
    const thisMonth: Conversation[] = []
    const older: Conversation[] = []
    
    const now = new Date()
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayDate = new Date(todayDate)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const thisWeekDate = new Date(todayDate)
    thisWeekDate.setDate(thisWeekDate.getDate() - 7)
    const thisMonthDate = new Date(todayDate)
    thisMonthDate.setDate(thisMonthDate.getDate() - 30)
    
    filteredConversations.forEach(conversation => {
      const convDate = new Date(conversation.updatedAt)
      if (convDate >= todayDate) {
        today.push(conversation)
      } else if (convDate >= yesterdayDate) {
        yesterday.push(conversation)
      } else if (convDate >= thisWeekDate) {
        thisWeek.push(conversation)
      } else if (convDate >= thisMonthDate) {
        thisMonth.push(conversation)
      } else {
        older.push(conversation)
      }
    })
    
    const groups: ConversationGroup[] = []
    
    if (today.length > 0) {
      groups.push({ 
        title: 'Today', 
        items: today.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
      })
    }
    
    if (yesterday.length > 0) {
      groups.push({ 
        title: 'Yesterday', 
        items: yesterday.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
      })
    }
    
    if (thisWeek.length > 0) {
      groups.push({ 
        title: 'This Week', 
        items: thisWeek.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
      })
    }
    
    if (thisMonth.length > 0) {
      groups.push({ 
        title: 'This Month', 
        items: thisMonth.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
      })
    }
    
    if (older.length > 0) {
      groups.push({ 
        title: 'Older', 
        items: older.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
      })
    }
    
    return groups
  }, [conversations, searchQuery])
} 