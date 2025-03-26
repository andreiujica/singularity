import * as React from "react"

import { SearchForm } from "@/components/sidebar/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { SidebarLogo } from "@/components/sidebar/logo"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Today",
      url: "#",
      items: [
        {
          title: "I have a new idea for a product",
          url: "#",
          isActive: true,
        },
        {
          title: "I want to build a new website",
          url: "#",
        },
      ],
    },
    {
      title: "Yesterday",
      url: "#",
      items: [
        {
          title: "I have a question about the product and it is really long and I need to ask it",
          url: "#",
        },
        {
          title: "Help me write a blog post",
          url: "#",
        },
        {
          title: "Hi, how are you?",
          url: "#",
        },
        {
          title: "Hey, what is the weather in Tokyo in the next 7 days?",
          url: "#",
        },
      ],
    },
    {
      title: "Last week",
      url: "#",
      items: [
        {
            title: "My name is John Doe and I want to build a new website",
            url: "#",
        },
        {
            title: "I have a friend who is a software engineer and I want to build a new website",
            url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-col gap-4">
        <SidebarLogo />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
