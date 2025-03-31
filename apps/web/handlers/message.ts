/**
 * Message handler functions for managing conversation messages
 * 
 * This file contains utility functions for:
 * - Adding messages to conversations
 * - Sending messages via WebSocket
 * - Managing message state
 */

import { v4 as uuidv4 } from "uuid";
import { 
  Conversation, 
  Message, 
  MessageSendResult 
} from "@/types/chat";
import { websocketService } from "@/lib/websocket-service";
import { Dispatch, SetStateAction } from "react";

/**
 * Adds a user message to a conversation
 * 
 * Creates a new message with the user role, adds it to the specified
 * conversation, and updates the conversation's timestamp.
 * 
 * @param content - The message content
 * @param conversationId - The ID of the conversation to add the message to
 * @param setConversations - State setter function for conversations
 * @returns The created message object
 */
export const addUserMessage = (
  content: string,
  conversationId: string,
  setConversations: Dispatch<SetStateAction<Conversation[]>>
): Message => {
  // Create user message with UUID and current timestamp
  const userMessage: Message = {
    id: uuidv4(),
    content,
    role: 'user',
    conversationId,
    createdAt: new Date(),
  };
  
  // Add message to conversation and update timestamps
  setConversations(prev => 
    prev.map(c => {
      if (c.id !== conversationId) return c;
      
      return {
        ...c,
        messages: [...c.messages, userMessage],
        updatedAt: new Date(),
      };
    })
  );
  
  return userMessage;
};

/**
 * Adds an assistant message to a conversation
 * 
 * Creates a new message with the assistant role, adds it to the specified
 * conversation, and updates the conversation's timestamp.
 * 
 * @param content - The message content
 * @param conversationId - The ID of the conversation to add the message to
 * @param setConversations - State setter function for conversations
 * @returns The created message object
 */
export const addAssistantMessage = (
  content: string,
  conversationId: string,
  setConversations: Dispatch<SetStateAction<Conversation[]>>
): Message => {
  // Create assistant message with UUID and current timestamp
  const assistantMessage: Message = {
    id: uuidv4(),
    content,
    role: 'assistant',
    conversationId,
    createdAt: new Date(),
  };
  
  // Add message to conversation and update timestamps
  setConversations(prev => 
    prev.map(c => {
      if (c.id !== conversationId) return c;
      
      return {
        ...c,
        messages: [...c.messages, assistantMessage],
        updatedAt: new Date(),
      };
    })
  );
  
  return assistantMessage;
};

/**
 * Sends a chat message through the WebSocket connection
 * 
 * Formats the conversation messages for the WebSocket API and
 * sends them with the specified model.
 * 
 * @param conversation - The conversation containing message history
 * @param userMessage - The new user message to send
 * @param setIsLoading - State setter function for loading state
 * @param model - The model to use for generating a response (default: gpt-4o-mini)
 * @returns Object containing success status and request ID or error
 */
export const sendChatMessage = (
  conversation: Conversation,
  userMessage: Message,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  model: string = "gpt-4o-mini"
): MessageSendResult => {
  // Prepare messages for WebSocket in the format expected by the API
  const messages = [
    ...conversation.messages,
    userMessage
  ].map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
  
  // Set loading state and send the message
  setIsLoading(true);
  
  try {
    // Send message and get request ID
    const requestId = websocketService.sendChatMessage(messages, model);
    return { 
      success: true, 
      requestId: requestId || "" 
    };
  } catch (error) {
    // Handle any errors during sending
    console.error("Failed to send message:", error);
    setIsLoading(false);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}; 