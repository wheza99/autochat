// Sidebar kanan yang menampilkan dashboard agent dan dokumen
import * as React from "react";
import { AgentDashboard } from "./agent-dashboard";
import { DocumentSection } from "./document-section";
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
      <SidebarContent className="pt-2">
        <div className="px-2">
          <AgentDashboard />
        </div>
        <div className="px-2 pt-8">
          <DocumentSection />
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
