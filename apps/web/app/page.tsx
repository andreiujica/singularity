"use client"

import { useRef } from "react"
import { AppSidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatArea, ChatAreaHandle } from "@/components/chat/textarea"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import { ChatBubble } from "@/components/chat/bubble"
import { WelcomeScreen } from "@/components/chat/welcome"
import { useChatContext } from "@/providers/chat"
import { useEffect } from "react"
import { Conversation, Message } from "@/types/chat"
import { useAutoScroll } from "@/hooks/use-auto-scroll"

/**
 * Hook to ensure an initial conversation exists
 * @returns The current conversation
 */
function useEnsureConversation(): Conversation | null {
  const { conversations, currentConversationId, createConversation } = useChatContext()
  const hasCreatedInitialConversation = useRef(false)
  
  // Get current conversation
  const currentConversation = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId) || null
    : null
  
  // Ensure we have a conversation - using ref to prevent double creation
  useEffect(() => {
    if (!currentConversationId && conversations.length === 0 && !hasCreatedInitialConversation.current) {
      hasCreatedInitialConversation.current = true
      createConversation("New Chat")
    }
  }, [currentConversationId, conversations.length, createConversation])
  
  return currentConversation
}

/**
 * Main page component
 * 
 * This component orchestrates the chat functionality using custom hooks:
 * - useEnsureConversation: Ensures at least one conversation exists
 * - useAutoScroll: Handles automatic scrolling to the latest message
 */
export default function Page() {
  // Get current conversation using our custom hook
  const currentConversation = useEnsureConversation()
  
  // Create refs
  const chatAreaRef = useRef<ChatAreaHandle>(null)
  
  // Setup auto-scrolling
  const messagesEndRef = useAutoScroll([currentConversation?.messages])

  /**
   * Handles suggestion clicks from the welcome screen
   * @param text The suggestion text to send
   */
  const handleSuggestionClick = (text: string) => {
    if (chatAreaRef.current) {
      // Set the message text in the input
      chatAreaRef.current.setMessage(text)
      
      // Small delay to ensure the UI updates before sending
      setTimeout(() => {
        if (chatAreaRef.current) {
          chatAreaRef.current.sendMessage()
        }
      }, 100)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        {/* Header with app title and controls */}
        <Header />
        
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="w-full flex flex-col flex-1">
            {/* Show message history or welcome screen */}
            {currentConversation?.messages?.length ? (
              // Messages list with scroll area
              <div className="flex-1 px-4 py-6 overflow-y-auto">
                {/* Render each message as a chat bubble */}
                {currentConversation.messages.map((message: Message) => (
                  <ChatBubble 
                    key={message.id} 
                    content={message.content} 
                    isUser={message.role === 'user'} 
                    metrics={message.role === 'assistant' ? message.metrics : undefined}
                  />
                ))}
                {/* Invisible element at the bottom for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              // Welcome screen with suggestions
              <div className="flex-1 flex items-center justify-center">
                <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
              </div>
            )}
            
            {/* Chat input area fixed at bottom */}
            <ChatArea ref={chatAreaRef} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
