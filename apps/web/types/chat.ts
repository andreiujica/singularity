// Chat-related type definitions

// Message type
export interface Message {
  id: string;
  content: string;
  role: "system" | "user" | "assistant";
  conversationId: string;
  createdAt: Date;
  metrics?: {
    responseTime?: number;
    length?: number;
  };
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
export interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  createConversation: (title?: string) => string;
  switchConversation: (conversationId: string) => void;
  sendMessage: (content: string) => void;
  isLoading: boolean;
  isConnected: boolean;
  connectionError: string | null;
  retryConnection: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
} 