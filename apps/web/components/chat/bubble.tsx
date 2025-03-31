"use client"

import { UserBubble } from "@/components/chat/user-bubble"
import { AssistantBubble } from "@/components/chat/assistant-bubble"

interface ChatBubbleProps {
  content: string
  isUser?: boolean
  className?: string
  metrics?: {
    responseTime?: number
    length?: number
  }
}

export function ChatBubble({ content, isUser = true, className, metrics }: ChatBubbleProps) {
  return (
    <div className="w-full px-2 sm:px-3 py-0.5 sm:py-1">
      <div className="max-w-3xl mx-auto">
        {isUser ? (
          <UserBubble content={content} className={className} />
        ) : (
          <AssistantBubble content={content} className={className} metrics={metrics} />
        )}
      </div>
    </div>
  )
} 