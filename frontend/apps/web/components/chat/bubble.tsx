"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
  // Convert double line breaks to special marker for better paragraph detection
  const processedContent = !isUser ? content.replace(/\n\n+/g, '\n\n&nbsp;\n\n') : content;
  
  // State for feedback buttons
  const [feedback, setFeedback] = React.useState<'up' | 'down' | null>(null);
  const [animating, setAnimating] = React.useState(false);
  
  // Handle feedback click
  const handleFeedback = (type: 'up' | 'down') => {
    setAnimating(true);
    setFeedback(prev => prev === type ? null : type);
    
    // Reset animation after duration
    setTimeout(() => {
      setAnimating(false);
    }, 500);
  };
  
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
              {metrics && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 sm:px-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  {metrics.responseTime !== undefined && (
                    <div className="flex items-center gap-1 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.25l3.28 3.28a.75.75 0 101.06-1.06l-3.59-3.59V5z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{metrics.responseTime}ms</span>
                    </div>
                  )}
                  {metrics.length !== undefined && (
                    <div className="flex items-center gap-1 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                      </svg>
                      <span className="truncate">{metrics.length} chars</span>
                    </div>
                  )}
                </div>
              )}
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
                
                {/* Feedback buttons */}
                <div className="flex justify-end items-center gap-2 mt-1 px-1">
                  <button 
                    onClick={() => handleFeedback('up')}
                    className={cn(
                      "p-1 rounded-full transition-all",
                      feedback === 'up' ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
                      animating && feedback === 'up' ? "animate-pulse scale-110" : ""
                    )}
                    aria-label="Thumbs up"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleFeedback('down')}
                    className={cn(
                      "p-1 rounded-full transition-all",
                      feedback === 'down' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
                      animating && feedback === 'down' ? "animate-pulse scale-110" : ""
                    )}
                    aria-label="Thumbs down"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M18.905 12.75a1.25 1.25 0 01-2.5 0v-7.5a1.25 1.25 0 112.5 0v7.5zM8.905 17v1.3c0 .268-.14.526-.395.607A2 2 0 016.905 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.242 0-2.26-1.01-2.146-2.247.193-2.08.652-4.082 1.341-5.974C3.743 3.677 4.825 3 5.995 3h3.192a3 3 0 011.342.317l2.733 1.366A3 3 0 0115.595 5h1.292v7h-.963c-.684 0-1.258.482-1.612 1.068a4.012 4.012 0 01-2.165 1.73c-.433.143-.854.386-1.012.814-.16.432-.248.9-.248 1.388z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 