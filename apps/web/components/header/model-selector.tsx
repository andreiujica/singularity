"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { useContext } from "react"
import { ChatContext } from "@/contexts/ChatContext"
import { availableModels } from "@/constants/models"
import { ModelItem } from "./model-item"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useContext(ChatContext)
  const [open, setOpen] = React.useState(false)
  
  // Find the selected model in our models array
  const currentModel = availableModels.find(model => model.id === selectedModel) || availableModels[0]!

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="flex items-center justify-between gap-2 hover:text-lime-400"
              >
                {currentModel.name}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent align="start" className="w-80">
            <p>{currentModel.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent className="w-56">
        {availableModels.map((model) => (
          <ModelItem
            key={model.id}
            model={model}
            isSelected={currentModel.id === model.id}
            onSelect={setSelectedModel}
            onClose={() => setOpen(false)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 