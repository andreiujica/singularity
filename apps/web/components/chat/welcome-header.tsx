"use client"

import { Sparkles } from "lucide-react"
import { welcomeScreen } from "@/constants/ui-text"

export function WelcomeHeader() {
  return (
    <div className="mb-4 sm:mb-6 text-center">
      <div className="flex justify-center mb-2 sm:mb-3">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lime-700 dark:text-lime-300" />
        </div>
      </div>
      <h1 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{welcomeScreen.title}</h1>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto px-4">
        {welcomeScreen.subtitle}
      </p>
    </div>
  )
} 