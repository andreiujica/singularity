export interface Model {
  id: string
  name: string
  description: string
}

export const availableModels: Model[] = [
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