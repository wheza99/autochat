// Sidebar kanan yang menampilkan chat interface
import * as React from "react";
import ChatInterface from "@/components/chat/chat-interface";
import { AgentHeader } from "./agent-header";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex w-[320px]"
      {...props}
    >
      <SidebarContent className="flex flex-col h-full">
        <div className="px-2 pt-2">
          <AgentHeader />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
