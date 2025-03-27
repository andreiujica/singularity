"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { websocketService } from "@/lib/websocketService";

// Message types
export interface Message {
  id: string;
  content: string;
  role: "system" | "user" | "assistant";
  conversationId: string;
  createdAt: Date;
}

// Conversation type
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Chat context interface
interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  createConversation: (title?: string) => string;
  switchConversation: (conversationId: string) => void;
  sendMessage: (content: string) => void;
  isLoading: boolean;
  isConnected: boolean;
  connectionError: string | null;
  retryConnection: () => void;
}

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  conversations: [],
  currentConversationId: null,
  createConversation: () => "",
  switchConversation: () => {},
  sendMessage: () => {},
  isLoading: false,
  isConnected: false,
  connectionError: null,
  retryConnection: () => {},
});

// Chat Provider component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const activeRequestId = useRef<string | null>(null);
  
  // Function to get current conversation
  const getCurrentConversation = useCallback(() => {
    if (!currentConversationId) return null;
    return conversations.find(c => c.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  // Set up WebSocket event handlers
  useEffect(() => {
    // Initialize connection
    websocketService.connect();
    
    // Message handler
    const removeMessageListener = websocketService.onMessage((data) => {
      if (data.error) {
        console.error("WebSocket error:", data.error);
        setIsLoading(false);
        return;
      }
      
      if (data.request_id !== activeRequestId.current) {
        console.warn("Received message for inactive request:", data.request_id);
        return;
      }

      // For debugging
      console.debug("Processing message:", data.content);

      setConversations(prev => {
        // Get current conversation
        const updatedConversations = [...prev];
        const conversationIndex = updatedConversations.findIndex(
          c => c.id === currentConversationId
        );
        
        if (conversationIndex === -1) return prev;
        
        const conversation = updatedConversations[conversationIndex];
        
        // Ensure we have a valid conversation with messages
        if (!conversation || !conversation.messages) return prev;
        
        const messages = [...conversation.messages];
        
        // If finished signal, just mark complete
        if (data.finished) {
          // Mark request as complete
          activeRequestId.current = null;
          setIsLoading(false);
          return updatedConversations;
        }
        
        // Check if we already have an assistant message for this response
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        if (lastMessage && lastMessage.role === 'assistant') {
          // Update existing message with new content
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + data.content
          };
          
          messages[messages.length - 1] = updatedMessage;
        } else {
          // Add new assistant message
          messages.push({
            id: uuidv4(),
            content: data.content,
            role: 'assistant',
            conversationId: conversation.id,
            createdAt: new Date(),
          });
        }
        
        // Update the conversation with new messages
        updatedConversations[conversationIndex] = {
          ...conversation,
          messages,
          updatedAt: new Date()
        };
        
        return updatedConversations;
      });
    });
    
    // Error handler
    const removeErrorListener = websocketService.onError((error) => {
      console.error("WebSocket error:", error);
      setConnectionError("Failed to connect to chat server. Please try again later.");
      setIsLoading(false);
    });
    
    // Open handler
    const removeOpenListener = websocketService.onOpen(() => {
      setIsConnected(true);
      setConnectionError(null);
    });
    
    // Close handler
    const removeCloseListener = websocketService.onClose(() => {
      setIsConnected(false);
      
      if (isLoading) {
        setIsLoading(false);
        
        // If we were in the middle of a request, add an error message
        if (activeRequestId.current && currentConversationId) {
          setConversations(prev => {
            return prev.map(conversation => {
              if (conversation.id !== currentConversationId) return conversation;
              
              // Only add the error message if we don't already have one
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant' && 
                  lastMessage.content.includes("Connection lost")) {
                return conversation;
              }
              
              // Add system message about connection lost
              const errorMessage: Message = {
                id: uuidv4(),
                content: "Connection lost. Please try again.",
                role: 'assistant',
                conversationId: conversation.id,
                createdAt: new Date(),
              };
              
              return {
                ...conversation,
                messages: [...conversation.messages, errorMessage],
                updatedAt: new Date(),
              };
            });
          });
        }
        
        activeRequestId.current = null;
      }
    });
    
    // Clean up event listeners on unmount
    return () => {
      removeMessageListener();
      removeErrorListener();
      removeOpenListener();
      removeCloseListener();
    };
  }, [currentConversationId, isLoading]);

  // Retry connection function exposed through context
  const retryConnection = useCallback(() => {
    setConnectionError(null);
    websocketService.resetConnection();
  }, []);

  // Create a new conversation
  const createConversation = useCallback((title?: string) => {
    const id = uuidv4();
    const now = new Date();
    
    const newConversation: Conversation = {
      id,
      title: title || `Conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(id);
    
    return id;
  }, [conversations.length]);

  // Switch to a different conversation
  const switchConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
    }
  }, [conversations]);

  // Send a new message
  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || !currentConversationId || isLoading) return;
    
    const conversation = getCurrentConversation();
    if (!conversation) return;
    
    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      conversationId: currentConversationId,
      createdAt: new Date(),
    };
    
    // Add message to conversation
    setConversations(prev => 
      prev.map(c => {
        if (c.id !== currentConversationId) return c;
        
        return {
          ...c,
          messages: [...c.messages, userMessage],
          updatedAt: new Date(),
        };
      })
    );
    
    // Don't attempt to send if not connected
    if (!isConnected) {
      // Add error message
      setTimeout(() => {
        setConversations(prev => 
          prev.map(c => {
            if (c.id !== currentConversationId) return c;
            
            const errorMessage: Message = {
              id: uuidv4(),
              content: "Not connected to server. Please check your connection and try again.",
              role: 'assistant',
              conversationId: currentConversationId,
              createdAt: new Date(),
            };
            
            return {
              ...c,
              messages: [...c.messages, errorMessage],
              updatedAt: new Date(),
            };
          })
        );
      }, 100);
      return;
    }
    
    // Prepare messages for WebSocket
    const messages = [
      ...conversation.messages,
      userMessage
    ].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Send to WebSocket
    setIsLoading(true);
    try {
      const requestId = websocketService.sendChatMessage(messages);
      activeRequestId.current = requestId;
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
      
      // Add error message to conversation
      setConversations(prev => 
        prev.map(c => {
          if (c.id !== currentConversationId) return c;
          
          const errorMessage: Message = {
            id: uuidv4(),
            content: "Failed to send message. Please try again.",
            role: 'assistant',
            conversationId: currentConversationId,
            createdAt: new Date(),
          };
          
          return {
            ...c,
            messages: [...c.messages, errorMessage],
            updatedAt: new Date(),
          };
        })
      );
    }
  }, [currentConversationId, getCurrentConversation, isLoading, isConnected]);

  // Initialize with a conversation if empty
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, [conversations.length, createConversation]);

  return (
    <ChatContext.Provider 
      value={{
        conversations,
        currentConversationId,
        createConversation,
        switchConversation,
        sendMessage,
        isLoading,
        isConnected,
        connectionError,
        retryConnection,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 