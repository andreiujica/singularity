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
  const { createConversation, isLoading } = useChatContext()
  
  const handleCreateNewChat = () => {
    // Don't allow creating a new chat while text is generating
    if (isLoading) return;
    
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
              className={`size-7 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-lime-400'}`}
              onClick={handleCreateNewChat}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isLoading ? "Can't create a new chat while AI is responding" : "New chat"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
