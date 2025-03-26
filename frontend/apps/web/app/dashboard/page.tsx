import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ChatArea } from "@/components/chat-area"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col items-center">
          <div className="w-full max-w-5xl flex flex-col justify-center">
            <ChatArea />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
