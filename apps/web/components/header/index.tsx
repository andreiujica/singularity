"use client"

import { ThemeToggle } from "@/components/header/theme-toggle"
import { ProfileMenu } from "@/components/header/profile-menu"
import { ModelSelector } from "@/components/header/model-selector"
import { NewChat } from "@/components/header/new-chat"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

export function Header() {
  return (
    <header data-testid="header" className="flex h-16 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-ml-1 hover:text-lime-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle sidebar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <NewChat />
        
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <ModelSelector />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  )
} 