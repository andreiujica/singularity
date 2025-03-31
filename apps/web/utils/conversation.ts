import { Conversation } from "@/types/chat"

/**
 * Get a preview of the conversation content
 * Shows first message content (truncated) or falls back to title
 */
export function getConversationPreview(conversation: Conversation, maxLength: number = 50): string {
  if (conversation.messages.length > 0) {
    const firstMessage = conversation.messages[0]
    if (firstMessage) {
      // Truncate the message to a reasonable length
      const preview = firstMessage.content.substring(0, maxLength)
      return preview.length < firstMessage.content.length 
        ? `${preview}...` 
        : preview
    }
  }
  return conversation.title
} 