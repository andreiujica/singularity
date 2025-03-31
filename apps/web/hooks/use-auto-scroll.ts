import { useRef, useEffect } from "react"

/**
 * Hook for auto-scrolling to the bottom of a container
 * 
 * Creates a ref to attach to an element that should be scrolled into view
 * whenever the specified dependencies change.
 * 
 * @param dependencies The dependencies array that should trigger scrolling
 * @returns A ref to attach to the bottom element
 */
export function useAutoScroll(dependencies: unknown[]) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Scroll to bottom when dependencies change
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, dependencies)
  
  return scrollRef
} 