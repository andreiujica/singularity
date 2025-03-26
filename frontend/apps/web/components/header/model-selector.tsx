"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

type Model = {
  id: string
  name: string
  description: string
}

const models: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Most capable model for complex tasks and content."
  },
  {
    id: "gpt-4o-mini",
    name: "GPT 4o-mini",
    description: "Balanced performance for everyday tasks at a lower cost."
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    description: "Best for technical content, coding, and detailed analysis."
  }
]

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = React.useState<Model>(models[0]!)
  const [open, setOpen] = React.useState(false)

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
                {selectedModel.name}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent align="start" className="w-80">
            <p>{selectedModel.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent className="w-56">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => {
              setSelectedModel(model)
              setOpen(false)
            }}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span>{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
            {selectedModel.id === model.id && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 