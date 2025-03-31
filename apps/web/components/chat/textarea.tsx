"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@workspace/ui/components/button";
import { ArrowUp, ImageIcon, SendIcon, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useChatContext } from "@/hooks/useChatContext";

export type ChatAreaHandle = {
  setMessage: (text: string) => void;
  sendMessage: () => void;
};

export const ChatArea = forwardRef<ChatAreaHandle>((props, ref) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage: sendChatMessage, isLoading, isConnected, connectionError, retryConnection } = useChatContext();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setMessage: (text: string) => {
      setMessage(text);
    },
    sendMessage: handleSendMessage
  }));

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;
    
    sendChatMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-sidebar rounded-xl overflow-hidden w-full max-w-3xl mx-auto shadow-lg">
        {/* Connection error message */}
        {connectionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 border-t p-2 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{connectionError}</span>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={retryConnection}
              className="text-xs h-7 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </div>
        )}
                
        {/* Input area */}
        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="relative w-full">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={!isConnected ? "Waiting for connection..." : "Ask Singularity anything..."}
                rows={1}
                disabled={!isConnected || isLoading}
                className={cn(
                  "w-full border-none bg-sidebar shadow-none resize-none overflow-y-auto",
                  "text-base md:text-sm px-3 py-2 min-h-[36px] max-h-[200px]",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 outline-none",
                  "placeholder:text-muted-foreground/50",
                  (!isConnected || isLoading) && "opacity-70 cursor-not-allowed"
                )}
              />
            </div>
            
            <div className="flex justify-between items-center">
              {/* Left side - Image button or connection status */}
              {!isConnected && !isLoading ? (
                <div className="flex items-center text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Connecting...
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full flex-shrink-0 h-8 w-8"
                  disabled={!isConnected || isLoading}
                >
                  <ImageIcon className="size-4" />
                </Button>
              )}
              
              {/* Send button */}
              <Button
                type="button"
                size="sm"
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected || isLoading}
                className={cn(
                  "bg-lime-400 hover:bg-lime-500 text-white dark:text-black border-none rounded-full h-8 w-8 p-0",
                  (!message.trim() || !isConnected || isLoading) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})

ChatArea.displayName = "ChatArea"; 