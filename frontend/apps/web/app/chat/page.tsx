import { AppSidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatArea } from "@/components/chat-area"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import { ChatBubble } from "@/components/chat-bubble"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col items-center">
          <div className="w-full flex flex-col justify-center">
            <ChatBubble content="Hello! How can I help you today?" isUser={false} />
            <ChatBubble content="I need help creating a new website for my business." isUser={true} />
            <ChatBubble content="Sure, I'd be happy to help. What kind of business do you have and what are your main goals for the website?" isUser={false} />
            <ChatArea />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
