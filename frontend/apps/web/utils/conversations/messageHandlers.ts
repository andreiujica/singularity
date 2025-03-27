import { v4 as uuidv4 } from "uuid";
import { Conversation, Message } from "@/types/chat";
import { websocketService } from "@/lib/websocketService";
import { Dispatch, SetStateAction } from "react";

type MessageSendResult = {
  success: boolean;
  requestId?: string;
  error?: string;
};

/**
 * Add a user message to a conversation
 */
export const addUserMessage = (
  content: string,
  conversationId: string,
  setConversations: Dispatch<SetStateAction<Conversation[]>>
): Message => {
  // Create user message
  const userMessage: Message = {
    id: uuidv4(),
    content,
    role: 'user',
    conversationId,
    createdAt: new Date(),
  };
  
  // Add message to conversation
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
 * Add an assistant message to a conversation
 */
export const addAssistantMessage = (
  content: string,
  conversationId: string,
  setConversations: Dispatch<SetStateAction<Conversation[]>>
): Message => {
  // Create assistant message
  const assistantMessage: Message = {
    id: uuidv4(),
    content,
    role: 'assistant',
    conversationId,
    createdAt: new Date(),
  };
  
  // Add message to conversation
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
 * Send a message through the WebSocket
 */
export const sendChatMessage = (
  conversation: Conversation,
  userMessage: Message,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): MessageSendResult => {
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
    return { success: true, requestId: requestId || "" };
  } catch (error) {
    console.error("Failed to send message:", error);
    setIsLoading(false);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}; 