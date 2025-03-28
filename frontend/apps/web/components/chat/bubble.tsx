"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
        {isUser ? (
          <div className="w-full text-right">
            <div 
              className={cn(
                "rounded-lg overflow-hidden p-1.5 sm:p-2 inline-block text-left",
                "bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800/30 border max-w-[80%] sm:max-w-[70%] md:max-w-lg",
                className
              )}
            >
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="relative w-full">
                  <p className="w-full text-base md:text-sm px-1 sm:px-2 py-0.5 sm:py-1 whitespace-pre-wrap break-words">
                    {content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className={cn(
              "rounded-lg overflow-hidden p-1.5 sm:p-2",
              className
            )}
          >
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <div className="relative w-full">
                <div className="w-full text-base md:text-sm px-1 sm:px-2 py-0.5 sm:py-1 prose prose-sm dark:prose-invert max-w-none prose-p:mb-1 prose-p:mt-0 prose-p:leading-relaxed prose-li:my-0.5 prose-headings:mb-2 prose-headings:mt-3 prose-pre:my-2 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:p-2 prose-pre:rounded-md">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                    p: ({children}) => {
                      // Check if this paragraph only contains our special marker
                      if (children === '&nbsp;') {
                        return <div className="h-2"></div>;
                      }
                      return <p className="whitespace-pre-wrap mb-1">{children}</p>;
                    },
                    code: ({className, children, ...props}: any) => {
                      const match = /language-(\w+)/.exec(className || '')
                      const isInline = !match && !className
                      
                      return isInline ? (
                        <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="overflow-auto rounded-md bg-sidebar p-2 my-2">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      )
                    },
                    pre: ({children}) => <>{children}</>,
                    h1: ({children}) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-bold mt-3 mb-1.5">{children}</h3>,
                    h4: ({children}) => <h4 className="text-base font-bold mt-2 mb-1.5">{children}</h4>,
                    h5: ({children}) => <h5 className="text-sm font-bold mt-2 mb-1">{children}</h5>,
                    h6: ({children}) => <h6 className="text-xs font-bold mt-2 mb-1">{children}</h6>,
                    ul: ({children}) => <ul className="list-disc pl-6 space-y-0.5 my-1.5">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 space-y-0.5 my-1.5">{children}</ol>,
                    li: ({children}) => <li className="mb-0.5">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className="pl-4 border-l-4 border-zinc-200 dark:border-zinc-700 my-2 italic">
                        {children}
                      </blockquote>
                    ),
                    a: ({href, children}) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => <hr className="my-2 border-zinc-200 dark:border-zinc-700" />,
                    table: ({children}) => (
                      <div className="overflow-x-auto my-2 rounded-md">
                        <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700 table-auto rounded-md overflow-hidden">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({children}) => <thead className="bg-sidebar">{children}</thead>,
                    tbody: ({children}) => <tbody>{children}</tbody>,
                    tr: ({children}) => <tr className="border-b border-zinc-300 dark:border-zinc-700">{children}</tr>,
                    th: ({children}) => <th className="px-4 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-r last:border-r-0 border-zinc-300 dark:border-zinc-700">{children}</th>,
                    td: ({children}) => <td className="px-4 py-2 text-sm border-r last:border-r-0 border-zinc-300 dark:border-zinc-700">{children}</td>
                  }}>
                    {processedContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 