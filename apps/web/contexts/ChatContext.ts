import { createContext } from "react";
import { ChatContextType } from "@/types/chat";

// Create context with default values
export const ChatContext = createContext<ChatContextType>({
  conversations: [],
  currentConversationId: null,
  createConversation: () => "",
  switchConversation: () => {},
  sendMessage: () => {},
  isLoading: false,
  isConnected: false,
  connectionError: null,
  retryConnection: () => {},
  selectedModel: "gpt-4o-mini",
  setSelectedModel: () => {},
}); 