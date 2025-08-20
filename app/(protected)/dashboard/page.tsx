// Halaman dashboard utama dengan tabs dan sidebar
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AgentProvider, useAgent } from "@/contexts/agent-context";
import { BasicInformationContent } from "./components/basic-information-content";
import { SystemPromptSection } from "./components/system-prompt-section";
import { DocumentSection } from "./components/document-section";
import { WhatsAppSection } from "./components/whatsapp-section";

// Inner component that uses the agent context
function DashboardContent() {
  const { selectedAgent, agents, setSelectedAgent } = useAgent();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("agent-info");

  // Handle agent_id parameter from URL
  useEffect(() => {
    const agentId = searchParams.get("agent_id");
    if (agentId && agents.length > 0) {
      const agent = agents.find((a) => a.id === agentId);
      if (agent && agent.id !== selectedAgent?.id) {
        setSelectedAgent(agent);
      }
    }
  }, [searchParams, agents, selectedAgent, setSelectedAgent]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {selectedAgent && (
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">
                      {selectedAgent.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content Area with Tabs */}
        <div className="flex-1 p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="space-y-2 pb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Agent {selectedAgent?.name ?? "Unknown"}
            </h1>
            <p className="text-lg text-muted-foreground">
              View and manage details agent
            </p>
          </div>

          {!selectedAgent ? (
            <div className="flex items-center justify-center h-full text-center">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                Select an Agent
              </h2>
              <p className="text-muted-foreground">
                Choose an agent from the sidebar to manage its settings.
              </p>
            </div>
          ) : (
            <div className="lg:flex gap-4">
              <div className="flex-1 lg:hidden">
                <BasicInformationContent />
                <WhatsAppSection />
              </div>
              <div className="flex-2">
                <SystemPromptSection />
                <DocumentSection />
              </div>
              <div className="flex-1 lg:block">
                <BasicInformationContent />
                <WhatsAppSection />
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <AgentProvider>
      <DashboardContent />
    </AgentProvider>
  );
}
