"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileMenu } from "@/components/profile-menu"
import { ModelSelector } from "@/components/model-selector"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 hover:text-lime-400" />
        <Button variant="ghost" size="icon" className="size-7 hover:text-lime-400">
          <Plus className="w-4 h-4" />
        </Button>
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