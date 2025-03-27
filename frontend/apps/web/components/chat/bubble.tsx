"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import ReactMarkdown from "react-markdown"

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
              : "bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/30",
            className
          )}
        >
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="relative w-full">
              {isUser ? (
                <p className="w-full text-base md:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-pre-wrap break-words">
                  {content}
                </p>
              ) : (
                <div className="w-full text-base md:text-sm px-2 sm:px-3 py-1 sm:py-2 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 prose-pre:my-0 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:p-2 prose-pre:rounded-md">
                  <ReactMarkdown>
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 