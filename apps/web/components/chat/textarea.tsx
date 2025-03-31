"use client"

import { useState, forwardRef, useImperativeHandle } from "react"
import { useChatContext } from "@/hooks/useChatContext"
import { ConnectionError } from "@/components/chat/connection-error"
import { TextareaInput } from "@/components/chat/textarea-input"
import { ActionButtons } from "@/components/chat/action-buttons"

export type ChatAreaHandle = {
  setMessage: (text: string) => void
  sendMessage: () => void
}

export const ChatArea = forwardRef<ChatAreaHandle>((props, ref) => {
  const [message, setMessage] = useState("")
  const { 
    sendMessage: sendChatMessage, 
    isLoading, 
    isConnected, 
    connectionError, 
    retryConnection 
  } = useChatContext()

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setMessage: (text: string) => {
      setMessage(text)
    },
    sendMessage: handleSendMessage
  }))

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return
    
    sendChatMessage(message)
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // We want to prevent the default behavior of the enter key when the shift key is pressed
    // As the shift key is used to create a new line in the textarea
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="w-full px-2 sm:px-4 sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-sidebar rounded-xl overflow-hidden w-full max-w-3xl mx-auto shadow-lg">
        {/* Connection error message */}
        {connectionError && (
          <ConnectionError 
            errorMessage={connectionError} 
            onRetry={retryConnection} 
          />
        )}
                
        {/* Input area */}
        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:gap-3">
            <TextareaInput 
              value={message}
              onChange={setMessage}
              onKeyDown={handleKeyDown}
              placeholder={!isConnected ? "Waiting for connection..." : "Ask Singularity anything..."}
              disabled={!isConnected || isLoading}
            />
            
            <ActionButtons 
              isConnected={isConnected}
              isLoading={isLoading}
              hasMessage={!!message.trim()}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

ChatArea.displayName = "ChatArea" 