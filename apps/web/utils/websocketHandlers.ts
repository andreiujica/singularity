import { v4 as uuidv4 } from "uuid";
import { Conversation, Message } from "@/types/chat";
import { SetStateAction, Dispatch } from "react";
import { websocketService } from "@/lib/websocketService";

/**
 * Creates a WebSocket open event handler
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
 */
export const createMessageHandler = (
  currentConversationId: string | null,
  activeRequestId: React.MutableRefObject<string | null>,
  setConversations: Dispatch<SetStateAction<Conversation[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  return (data: any) => {
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
        
        // If we have metrics and an assistant message, attach metrics to the message
        if (data.metrics && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            // Add metrics to the message
            messages[messages.length - 1] = {
              ...lastMessage,
              metrics: data.metrics
            };
            
            // Update the conversation with the metrics
            updatedConversations[conversationIndex] = {
              ...conversation,
              messages,
              updatedAt: new Date()
            };
          }
        }
        
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
  };
};

/**
 * Creates a WebSocket error event handler
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
  };
}; 