"use client"

import { Check } from "lucide-react"
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"
import { Model } from "@/constants/models"

interface ModelItemProps {
  model: Model
  isSelected: boolean
  onSelect: (id: string) => void
  onClose: () => void
}

export function ModelItem({ model, isSelected, onSelect, onClose }: ModelItemProps) {
  return (
    <DropdownMenuItem
      key={model.id}
      onClick={() => {
        onSelect(model.id)
        onClose()
      }}
      className="flex items-center justify-between"
    >
      <div className="flex flex-col">
        <span>{model.name}</span>
        <span className="text-xs text-muted-foreground">{model.description}</span>
      </div>
      {isSelected && <Check className="h-4 w-4 ml-2" />}
    </DropdownMenuItem>
  )
} 