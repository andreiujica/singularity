"use client";

import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { websocketService } from "@/lib/websocketService";
import { ChatContext } from "@/contexts/chat";
import { Conversation } from "@/types/chat";
import { 
  createMessageHandler, 
  createErrorHandler, 
  createCloseHandler,
  createOpenHandler
} from "@/handlers/websocket";
import {
  addUserMessage,
  addAssistantMessage,
  sendChatMessage
} from "@/handlers/message";

/**
 * Custom hook to use the chat context
 * 
 * This hook provides access to the chat context value and ensures
 * it's only used within a ChatProvider component.
 */
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

/**
 * Chat Provider component
 * 
 * Manages conversations, messages, and WebSocket communication.
 * Provides chat functionality to the entire application.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  // ===== State =====
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const activeRequestId = useRef<string | null>(null);
  
  // ===== Conversation Management Methods =====
  
  /**
   * Gets the current active conversation
   */
  const getCurrentConversation = useCallback(() => {
    if (!currentConversationId) return null;
    return conversations.find(c => c.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  /**
   * Creates a new conversation
   */
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

  /**
   * Switches to a different conversation
   */
  const switchConversation = useCallback((conversationId: string) => {
    // Prevent switching if we're currently loading a response
    if (isLoading) return;
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
    }
  }, [conversations, isLoading]);

  /**
   * Sends a new message in the current conversation
   */
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
    
    // Send message through WebSocket with selected model
    const result = sendChatMessage(conversation, userMessage, setIsLoading, selectedModel);
    
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
  }, [currentConversationId, getCurrentConversation, isLoading, isConnected, selectedModel]);
  
  // ===== WebSocket Management =====
  
  /**
   * Retries WebSocket connection after an error
   */
  const retryConnection = useCallback(() => {
    setConnectionError(null);
    websocketService.resetConnection();
  }, []);

  /**
   * Sets up WebSocket event handlers
   */
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
    
    const openHandler = createOpenHandler(
      setIsConnected,
      setConnectionError
    );
    
    // Register handlers
    const removeMessageListener = websocketService.onMessage(messageHandler);
    const removeErrorListener = websocketService.onError(errorHandler);
    const removeOpenListener = websocketService.onOpen(openHandler);
    const removeCloseListener = websocketService.onClose(closeHandler);
    
    // Clean up event listeners on unmount
    return () => {
      removeMessageListener();
      removeErrorListener();
      removeOpenListener();
      removeCloseListener();
    };
  }, [currentConversationId, isLoading]);

  // ===== Render =====
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
        selectedModel,
        setSelectedModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
} 