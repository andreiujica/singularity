"use client"

import { useRef, useEffect } from "react"
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

export default function Page() {
  const { conversations, currentConversationId, createConversation } = useChatContext();
  const chatAreaRef = useRef<ChatAreaHandle>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasCreatedInitialConversation = useRef(false);
  
  // Get current conversation messages
  const currentConversation = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId) 
    : null;
  
  // Ensure we have a conversation - using ref to prevent double creation
  useEffect(() => {
    // Only create a conversation if we don't have one and haven't created one yet
    if (!currentConversationId && conversations.length === 0 && !hasCreatedInitialConversation.current) {
      hasCreatedInitialConversation.current = true;
      createConversation("New Chat");
    }
  }, [currentConversationId, conversations.length, createConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  // Handle suggestion clicks
  const handleSuggestionClick = (text: string) => {
    if (chatAreaRef.current) {
      chatAreaRef.current.setMessage(text);
      
      // Small delay to ensure the UI updates before sending
      setTimeout(() => {
        if (chatAreaRef.current) {
          chatAreaRef.current.sendMessage();
          // Scroll to bottom after sending
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="w-full flex flex-col flex-1">
            {/* If we have conversation messages, display them */}
            {currentConversation?.messages?.length ? (
              <div className="flex-1 px-4 py-6 overflow-y-auto">
                {currentConversation.messages.map(message => (
                  <ChatBubble 
                    key={message.id} 
                    content={message.content} 
                    isUser={message.role === 'user'} 
                    metrics={message.role === 'assistant' ? message.metrics : undefined}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              // Welcome screen if no messages
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
