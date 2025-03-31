"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { Button } from "@workspace/ui/components/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

type FeedbackButtonsProps = ReturnType<typeof useFeedback>

export function FeedbackButtons({ feedback, animating, handleFeedback }: FeedbackButtonsProps) {
  return (
    <div className="flex justify-end items-center gap-0.5 mt-0.5">
      <Button 
        onClick={() => handleFeedback('up')}
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 p-0.5 rounded-full transition-all",
          feedback === 'up' ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
          animating && feedback === 'up' ? "animate-pulse scale-110" : ""
        )}
        aria-label="Thumbs up"
      >
        <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </Button>
      <Button 
        onClick={() => handleFeedback('down')}
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 p-0.5 rounded-full transition-all",
          feedback === 'down' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
          animating && feedback === 'down' ? "animate-pulse scale-110" : ""
        )}
        aria-label="Thumbs down"
      >
        <ThumbsDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </Button>
    </div>
  );
} 