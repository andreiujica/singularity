"use client"

import { useEffect, useRef } from "react"
import { cn } from "@workspace/ui/lib/utils"

interface TextareaInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder: string
  disabled: boolean
}

export function TextareaInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled
}: TextareaInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  return (
    <div className="relative w-full">
      <textarea
        data-testid="chat-textarea"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className={cn(
          "w-full border-none bg-sidebar shadow-none resize-none overflow-y-auto",
          "text-base md:text-sm px-3 py-2 min-h-[36px] max-h-[200px]",
          "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 outline-none",
          "placeholder:text-muted-foreground/50",
          disabled && "opacity-70 cursor-not-allowed"
        )}
      />
    </div>
  )
} 