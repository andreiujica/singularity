"use client";

import { useContext } from "react";
import { ChatContext } from "@/contexts/ChatContext";

// Custom hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 