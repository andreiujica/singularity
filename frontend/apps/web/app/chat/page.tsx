"use client"

import { AppSidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatArea } from "@/components/chat/textarea"
import { useEffect } from "react"

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import { ChatBubble } from "@/components/chat/bubble"
import { useChatContext } from "@/hooks/useChatContext"

export default function Page() {
  const { conversations, currentConversationId, createConversation } = useChatContext();
  
  // Get current conversation messages
  const currentConversation = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId) 
    : null;
  
  // Ensure we have a conversation
  useEffect(() => {
    if (!currentConversationId && conversations.length === 0) {
      createConversation("New Chat");
    }
  }, [currentConversationId, conversations.length, createConversation]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col items-center overflow-y-auto">
          <div className="w-full flex flex-col justify-center">
            {/* If we have a conversation, display its messages */}
            {currentConversation?.messages?.length ? (
              currentConversation.messages.map(message => (
                <ChatBubble 
                  key={message.id} 
                  content={message.content} 
                  isUser={message.role === 'user'} 
                />
              ))
            ) : (
              // Default welcome message if no conversation exists
              <ChatBubble 
                content="Hello! How can I help you today?" 
                isUser={false} 
              />
            )}
            <ChatArea />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
