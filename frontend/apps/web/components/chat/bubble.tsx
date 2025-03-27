"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import ReactMarkdown from "react-markdown"
import { Components } from "react-markdown"

interface ChatBubbleProps {
  content: string
  isUser?: boolean
  className?: string
}

export function ChatBubble({ content, isUser = true, className }: ChatBubbleProps) {
  // Convert double line breaks to special marker for better paragraph detection
  const processedContent = !isUser ? content.replace(/\n\n+/g, '\n\n&nbsp;\n\n') : content;
  
  return (
    <div className="w-full px-2 sm:px-3 py-0.5 sm:py-1">
      <div className="max-w-3xl mx-auto">
        <div 
          className={cn(
            "rounded-lg overflow-hidden p-1.5 sm:p-2",
            isUser 
              ? "bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800/30 border max-w-[80%] sm:max-w-[70%] md:max-w-lg ml-auto" 
              : "",
            className
          )}
        >
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className="relative w-full">
              {isUser ? (
                <p className="w-full text-base md:text-sm px-1 sm:px-2 py-0.5 sm:py-1 whitespace-pre-wrap break-words">
                  {content}
                </p>
              ) : (
                <div className="w-full text-base md:text-sm px-1 sm:px-2 py-0.5 sm:py-1 prose prose-sm dark:prose-invert max-w-none prose-p:mb-4 prose-p:mt-0 prose-p:leading-relaxed prose-li:my-1 prose-headings:mb-3 prose-headings:mt-5 prose-pre:my-3 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:p-2 prose-pre:rounded-md">
                  <ReactMarkdown components={{
                    p: ({children}) => {
                      // Check if this paragraph only contains our special marker
                      if (children === '&nbsp;') {
                        return <div className="h-4"></div>;
                      }
                      return <p className="whitespace-pre-wrap">{children}</p>;
                    },
                    code: ({className, children, ...props}: any) => {
                      const match = /language-(\w+)/.exec(className || '')
                      const isInline = !match && !className
                      
                      return isInline ? (
                        <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                    ul: ({children}) => <ul className="list-disc pl-6 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 space-y-2">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>
                  }}>
                    {processedContent}
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