"use client"

import { cn } from "@workspace/ui/lib/utils"

interface UserBubbleProps {
  content: string;
  className?: string;
}

export function UserBubble({ content, className }: UserBubbleProps) {
  return (
    <div className="w-full text-right">
      <div 
        data-testid="user-message"
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
  );
} 