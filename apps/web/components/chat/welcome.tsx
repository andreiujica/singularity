"use client"

import { WelcomeHeader } from "@/components/chat/welcome-header"
import { SuggestionsGrid } from "@/components/chat/suggestions-grid"
import { chatSuggestions } from "@/constants/suggestions"

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center px-3 sm:px-4 py-6 sm:py-8 max-w-3xl mx-auto w-full">
      <WelcomeHeader />
      <SuggestionsGrid 
        suggestions={chatSuggestions}
        onSuggestionClick={onSuggestionClick}
      />
    </div>
  )
} 