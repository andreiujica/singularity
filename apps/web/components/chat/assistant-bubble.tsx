"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { MarkdownRenderer } from "@/components/chat/markdown-renderer"
import { MessageMetrics } from "@/components/chat/message-metrics"
import { FeedbackButtons } from "@/components/chat/feedback-buttons"

interface AssistantBubbleProps {
  content: string;
  className?: string;
  metrics?: {
    responseTime?: number;
    length?: number;
  }
}

export function AssistantBubble({ content, className, metrics }: AssistantBubbleProps) {
  const feedbackProps = useFeedback();
  
  return (
    <div 
      className={cn(
        "rounded-lg overflow-hidden p-1.5 sm:p-2 max-w-[90%] sm:max-w-[95%] md:max-w-full",
        className
      )}
    >
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <MessageMetrics metrics={metrics} />
        <div className="relative w-full overflow-hidden">
          <div className="w-full text-base md:text-sm px-1 sm:px-2 py-0.5 sm:py-1 prose prose-sm dark:prose-invert max-w-none prose-p:mb-1 prose-p:mt-0 prose-p:leading-relaxed prose-li:my-0.5 prose-headings:mb-2 prose-headings:mt-3 prose-pre:my-2 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:p-2 prose-pre:rounded-md overflow-x-auto">
            <MarkdownRenderer content={content} />
          </div>
          <FeedbackButtons {...feedbackProps} />
        </div>
      </div>
    </div>
  );
} 