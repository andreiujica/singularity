"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"

interface SuggestionCardProps {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
}

export function SuggestionCard({ title, description, icon, onClick }: SuggestionCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-lime-300 transition-colors h-full" 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full p-1 bg-lime-50 dark:bg-lime-950/50 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <CardTitle className="text-sm sm:text-base truncate">{title}</CardTitle>
          <CardDescription className="text-xs truncate">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
} 