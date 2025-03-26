"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ChatProvider } from "@/hooks/useChatContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ChatProvider>
        {children}
      </ChatProvider>
    </NextThemesProvider>
  )
}
