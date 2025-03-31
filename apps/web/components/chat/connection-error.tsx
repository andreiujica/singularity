"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface ConnectionErrorProps {
  errorMessage: string
  onRetry: () => void
}

export function ConnectionError({ errorMessage, onRetry }: ConnectionErrorProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 border-t p-2 text-sm flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
        <span className="text-red-700 dark:text-red-400">{errorMessage}</span>
      </div>
      <Button 
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="text-xs h-7 px-2"
      >
        <RefreshCw className="h-3 w-3 mr-1" /> Retry
      </Button>
    </div>
  )
} 