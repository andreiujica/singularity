"use client"

import { SuggestionCard } from "@/components/chat/suggestion-card"
import { Suggestion } from "@/constants/suggestions"

interface SuggestionsGridProps {
  suggestions: Suggestion[]
  onSuggestionClick: (text: string) => void
}

export function SuggestionsGrid({ suggestions, onSuggestionClick }: SuggestionsGridProps) {
  return (
    <div className="grid gap-2 sm:gap-3 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((suggestion, index) => (
        <SuggestionCard
          key={index}
          title={suggestion.title}
          description={suggestion.description}
          icon={suggestion.icon}
          onClick={() => onSuggestionClick(suggestion.prompt)}
        />
      ))}
    </div>
  )
} 