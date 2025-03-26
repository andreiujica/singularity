"use client"

import * as React from "react"
import { LogOut } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export function ProfileMenu() {
  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log("Logging out...")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="inline-flex items-center justify-center h-8 w-8 cursor-pointer bg-lime-400 hover:bg-lime-500 transition-colors">
          <AvatarFallback className="text-background text-sm">AU</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 cursor-pointer flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 