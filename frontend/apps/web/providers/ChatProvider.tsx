"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { websocketService } from "@/lib/websocketService";
import { ChatContext } from "@/contexts/ChatContext";
import { Conversation, Message } from "@/types/chat";
import { 
  createMessageHandler, 
  createErrorHandler, 
  createCloseHandler 
} from "@/utils/websocketHandlers";
import {
  addUserMessage,
  addAssistantMessage,
  sendChatMessage
} from "@/utils/conversations/messageHandlers";

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
    
    // Create handlers using our utility functions
    const messageHandler = createMessageHandler(
      currentConversationId, 
      activeRequestId,
      setConversations,
      setIsLoading
    );
    
    const errorHandler = createErrorHandler(
      setConnectionError,
      setIsLoading
    );
    
    const closeHandler = createCloseHandler(
      isLoading,
      activeRequestId,
      currentConversationId,
      setIsConnected,
      setIsLoading,
      setConversations
    );
    
    // Register handlers
    const removeMessageListener = websocketService.onMessage(messageHandler);
    const removeErrorListener = websocketService.onError(errorHandler);
    
    const removeOpenListener = websocketService.onOpen(() => {
      setIsConnected(true);
      setConnectionError(null);
    });
    
    const removeCloseListener = websocketService.onClose(closeHandler);
    
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
    
    // Add user message to conversation
    const userMessage = addUserMessage(content, currentConversationId, setConversations);
    
    // Don't attempt to send if not connected
    if (!isConnected) {
      // Add error message
      setTimeout(() => {
        addAssistantMessage(
          "Not connected to server. Please check your connection and try again.",
          currentConversationId,
          setConversations
        );
      }, 100);
      return;
    }
    
    // Send message through WebSocket
    const result = sendChatMessage(conversation, userMessage, setIsLoading);
    
    if (result.success && result.requestId) {
      activeRequestId.current = result.requestId;
    } else {
      // Add error message to conversation
      addAssistantMessage(
        "Failed to send message. Please try again.",
        currentConversationId,
        setConversations
      );
    }
  }, [currentConversationId, getCurrentConversation, isLoading, isConnected]);

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