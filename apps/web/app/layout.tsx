import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ChatProvider } from "@/providers/ChatProvider"

import "@workspace/ui/globals.css"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
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
      </body>
    </html>
  )
}
