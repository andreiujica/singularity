"use client"

import { Button } from "@workspace/ui/components/button"
import { ImageIcon, ArrowUp, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface ActionButtonsProps {
  isConnected: boolean
  isLoading: boolean
  hasMessage: boolean
  onSend: () => void
}

export function ActionButtons({
  isConnected,
  isLoading,
  hasMessage,
  onSend
}: ActionButtonsProps) {
  return (
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
        onClick={onSend}
        disabled={!hasMessage || !isConnected || isLoading}
        className={cn(
          "bg-lime-400 hover:bg-lime-500 text-white dark:text-black border-none rounded-full h-8 w-8 p-0",
          (!hasMessage || !isConnected || isLoading) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowUp className="size-4" />
        )}
      </Button>
    </div>
  )
} 