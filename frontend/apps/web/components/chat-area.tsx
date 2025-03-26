"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { ArrowUp, ImageIcon, SendIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export function ChatArea() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <div className="w-full mt-4 sm:mt-8 mb-auto px-2 sm:px-4">
      <div className="bg-sidebar rounded-xl overflow-hidden w-full max-w-3xl mx-auto">        
        {/* Input area */}
        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="relative w-full">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Singularity anything..."
                rows={1}
                className={cn(
                  "w-full border-none bg-sidebar shadow-none resize-none overflow-y-auto",
                  "text-base md:text-sm px-3 py-2 min-h-[36px] max-h-[200px]",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 outline-none",
                  "placeholder:text-muted-foreground/50"
                )}
              />
            </div>
            
            <div className="flex justify-between items-center">
              {/* Image attachment button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0 h-8 w-8"
              >
                <ImageIcon className="size-4" />
              </Button>
              
              {/* Send button */}
              <Button
                type="button"
                size="sm"
                className="bg-lime-400 hover:bg-lime-500 text-white dark:text-black border-none rounded-full h-8 w-8 p-0"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 