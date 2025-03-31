"use client"

import { Clock, Users } from "lucide-react"

interface MessageMetricsProps {
  metrics?: { 
    responseTime?: number;
    length?: number;
  }
}

export function MessageMetrics({ metrics }: MessageMetricsProps) {
  if (!metrics) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 sm:px-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
      {metrics.responseTime !== undefined && (
        <div className="flex items-center gap-1 min-w-0">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{metrics.responseTime}ms</span>
        </div>
      )}
      {metrics.length !== undefined && (
        <div className="flex items-center gap-1 min-w-0">
          <Users className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{metrics.length} chars</span>
        </div>
      )}
    </div>
  );
} 