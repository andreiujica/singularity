"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Sparkles, Code, PenLine, Brain } from "lucide-react"

type SuggestionCardProps = {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
}

function SuggestionCard({ title, description, icon, onClick }: SuggestionCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-lime-300 transition-colors" 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full p-1 bg-lime-50 dark:bg-lime-950/50">
          {icon}
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}

type WelcomeScreenProps = {
  onSuggestionClick: (text: string) => void
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const suggestions = [
    {
      title: "Creative Writing",
      description: "Get help with writing stories, poems, or creative content",
      icon: <PenLine className="h-5 w-5 text-lime-600 dark:text-lime-400" />,
      prompt: "Help me write a short story about a space explorer who discovers a new civilization."
    },
    {
      title: "Code Assistant",
      description: "Get help with coding and debugging",
      icon: <Code className="h-5 w-5 text-lime-600 dark:text-lime-400" />,
      prompt: "Explain how to implement a simple REST API with Node.js and Express."
    },
    {
      title: "Brainstorming",
      description: "Generate ideas or get help with problem-solving",
      icon: <Brain className="h-5 w-5 text-lime-600 dark:text-lime-400" />,
      prompt: "I need 5 creative ideas for a sustainable product that could help reduce plastic waste."
    }
  ]

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-3xl mx-auto w-full">
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900">
            <Sparkles className="h-4 w-4 text-lime-700 dark:text-lime-300" />
          </div>
        </div>
        <h1 className="font-bold mb-2">Welcome to Singularity</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Your AI assistant for creative writing, coding help, and more. 
          Choose a suggestion or type your own message to get started.
        </p>
      </div>
      
      <div className="grid gap-3 w-full md:grid-cols-3 grid-cols-1">
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
    </div>
  )
} 