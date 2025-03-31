import { PenLine, Code, Brain } from "lucide-react"
import { ReactNode } from "react"

export interface Suggestion {
  title: string
  description: string
  icon: ReactNode
  prompt: string
}

export const chatSuggestions: Suggestion[] = [
  {
    title: "Creative Writing",
    description: "Get help with writing stories, poems, or creative content",
    icon: <PenLine className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lime-600 dark:text-lime-400" />,
    prompt: "Help me write a short story about a space explorer who discovers a new civilization."
  },
  {
    title: "Code Assistant",
    description: "Get help with coding and debugging",
    icon: <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lime-600 dark:text-lime-400" />,
    prompt: "Explain how to implement a simple REST API with Node.js and Express."
  },
  {
    title: "Brainstorming",
    description: "Generate ideas or get help with problem-solving",
    icon: <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lime-600 dark:text-lime-400" />,
    prompt: "I need 5 creative ideas for a sustainable product that could help reduce plastic waste."
  }
] 