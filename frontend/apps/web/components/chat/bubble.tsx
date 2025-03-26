"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface ChatBubbleProps {
  content: string
  isUser?: boolean
  className?: string
}

export function ChatBubble({ content, isUser = true, className }: ChatBubbleProps) {
  return (
    <div className="w-full px-2 sm:px-4 py-1 sm:py-2">
      <div className="max-w-3xl mx-auto">
        <div 
          className={cn(
            "rounded-xl overflow-hidden p-2 sm:p-3 md:p-4",
            isUser 
              ? "bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800/30 border max-w-[80%] sm:max-w-[70%] md:max-w-lg ml-auto" 
              : "w-full bg-sidebar",
            className
          )}
        >
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="relative w-full">
              <p className="w-full text-base md:text-sm px-2 sm:px-3 py-1 sm:py-2">
                {content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 