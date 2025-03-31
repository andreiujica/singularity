/**
 * WebSocket event handler factory functions
 * 
 * This file contains factory functions that create event handlers for WebSocket events:
 * - open: Connection established
 * - message: Data received
 * - error: Connection error
 * - close: Connection closed
 * 
 * Each factory function takes state setters and returns an event handler function.
 */

import { v4 as uuidv4 } from "uuid";
import { Conversation, Message } from "@/types/chat";
import { SetStateAction, Dispatch } from "react";
import { websocketService } from "@/lib/websocketService";

/**
 * Creates a WebSocket open event handler
 * 
 * Handles what happens when a WebSocket connection is successfully established.
 * Updates connection state and clears any previous error messages.
 * 
 * @param setIsConnected - State setter for connection status
 * @param setConnectionError - State setter for connection error message
 * @returns A function that handles WebSocket open events
 */
export const createOpenHandler = (
  setIsConnected: Dispatch<SetStateAction<boolean>>,
  setConnectionError: Dispatch<SetStateAction<string | null>>
) => {
  return () => {
    setIsConnected(true);
    setConnectionError(null);
  };
};

/**
 * Creates a WebSocket message event handler
 * 
 * Handles incoming WebSocket messages from the server.
 * Updates conversation state with new message content or completion signals.
 * 
 * @param currentConversationId - ID of the active conversation
 * @param activeRequestId - Reference to the active request ID
 * @param setConversations - State setter for conversations
 * @param setIsLoading - State setter for loading state
 * @returns A function that handles WebSocket message events
 */
export const createMessageHandler = (
  currentConversationId: string | null,
  activeRequestId: React.MutableRefObject<string | null>,
  setConversations: Dispatch<SetStateAction<Conversation[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  return (data: any) => {
    // Handle error responses
    if (data.error) {
      console.error("WebSocket error:", data.error);
      setIsLoading(false);
      return;
    }
    
    // Verify this message is for the active request
    if (data.request_id !== activeRequestId.current) {
      console.warn("Received message for inactive request:", data.request_id);
      return;
    }

    console.debug("Processing message:", data.content);

    setConversations(prev => {
      // Find the current conversation
      const updatedConversations = [...prev];
      const conversationIndex = updatedConversations.findIndex(
        c => c.id === currentConversationId
      );
      
      // Return unchanged if conversation not found
      if (conversationIndex === -1) return prev;
      
      const conversation = updatedConversations[conversationIndex];
      
      // Return unchanged if conversation invalid
      if (!conversation || !conversation.messages) return prev;
      
      const messages = [...conversation.messages];
      
      // Handle completion signal
      if (data.finished) {
        activeRequestId.current = null;
        setIsLoading(false);
        
        // Add metrics to the last assistant message if available
        if (data.metrics && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            // Update the message with metrics
            messages[messages.length - 1] = {
              ...lastMessage,
              metrics: data.metrics
            };
            
            // Update the conversation
            updatedConversations[conversationIndex] = {
              ...conversation,
              messages,
              updatedAt: new Date()
            };
          }
        }
        
        return updatedConversations;
      }
      
      // Get the last message to check if we should append or create new
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      
      if (lastMessage && lastMessage.role === 'assistant') {
        // Append to existing assistant message
        const updatedMessage = {
          ...lastMessage,
          content: lastMessage.content + data.content
        };
        
        messages[messages.length - 1] = updatedMessage;
      } else {
        // Create new assistant message
        messages.push({
          id: uuidv4(),
          content: data.content,
          role: 'assistant',
          conversationId: conversation.id,
          createdAt: new Date(),
        });
      }
      
      // Update the conversation with new or updated message
      updatedConversations[conversationIndex] = {
        ...conversation,
        messages,
        updatedAt: new Date()
      };
      
      return updatedConversations;
    });
  };
};

/**
 * Creates a WebSocket error event handler
 * 
 * Handles WebSocket error events.
 * Updates UI state and error messages when connection issues occur.
 * 
 * @param setConnectionError - State setter for connection error message
 * @param setIsLoading - State setter for loading state
 * @returns A function that handles WebSocket error events
 */
export const createErrorHandler = (
  setConnectionError: Dispatch<SetStateAction<string | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  return (error: Event | Error) => {
    console.error("WebSocket error:", error);
    setConnectionError("Failed to connect to chat server. Please try again later.");
    setIsLoading(false);
  };
};

/**
 * Creates a WebSocket connection close handler
 * 
 * Handles WebSocket close events.
 * Updates connection state and adds error messages to conversations
 * if a request was in progress.
 * 
 * @param isLoading - Current loading state
 * @param activeRequestId - Reference to the active request ID
 * @param currentConversationId - ID of the active conversation
 * @param setIsConnected - State setter for connection status
 * @param setIsLoading - State setter for loading state
 * @param setConversations - State setter for conversations
 * @returns A function that handles WebSocket close events
 */
export const createCloseHandler = (
  isLoading: boolean,
  activeRequestId: React.MutableRefObject<string | null>,
  currentConversationId: string | null,
  setIsConnected: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setConversations: Dispatch<SetStateAction<Conversation[]>>
) => {
  return () => {
    setIsConnected(false);
    
    // Only add error message if we were in the middle of a request
    if (isLoading) {
      setIsLoading(false);
      
      if (activeRequestId.current && currentConversationId) {
        setConversations(prev => {
          return prev.map(conversation => {
            if (conversation.id !== currentConversationId) return conversation;
            
            // Avoid duplicate error messages
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant' && 
                lastMessage.content.includes("Connection lost")) {
              return conversation;
            }
            
            // Add error message about lost connection
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
  };
}; 