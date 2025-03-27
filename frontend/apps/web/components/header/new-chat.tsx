"use client"

import { Plus } from "lucide-react"
import { useChatContext } from "@/hooks/useChatContext"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

export function NewChat() {
  const { createConversation } = useChatContext()
  
  const handleCreateNewChat = () => {
    // Create a new conversation
    createConversation("New Chat")
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-7 hover:text-lime-400"
              onClick={handleCreateNewChat}
            >
              <Plus className="w-4 h-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New chat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
