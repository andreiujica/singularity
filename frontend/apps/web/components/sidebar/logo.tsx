import { forwardRef } from "react"
import { CircleSlash2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils" // utility function to merge classes if a parent component wants to style the logo


export const SidebarLogo = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
  ref={ref}
    className={cn(
      "flex items-center gap-2 px-2 py-3",
      className
    )}
    {...props}
  >
    {/* Icon with animated glow effect */}
    <div className="relative flex items-center justify-center">
      <div
        className="absolute h-5 w-5 rounded-full bg-lime-400/50 blur-md animate-pulse"
        style={{ animationDuration: '3s' }}
      />
      <CircleSlash2 className="relative h-6 w-6 text-lime-400" />
    </div>

    {/* App name and version badge */}
    <div className="flex items-center gap-2">
      <span className="font-semibold tracking-tight text-foreground">Singularity</span>
      <div className="flex h-5 items-center rounded-full bg-lime-400/10 px-1.5 text-[10px] font-medium text-lime-500 ring-1 ring-inset ring-lime-400/20">
        v1.0.0
      </div>
    </div>
  </div>
))

// displayName helps with debugging in React DevTools
SidebarLogo.displayName = "SidebarLogo" 