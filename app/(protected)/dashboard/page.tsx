// Halaman dashboard utama dengan tabs dan sidebar
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/shadcn-blocks/sidebar-08/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentProvider, useAgent } from "@/contexts/agent-context";
import { BasicInformationContent } from "./components/basic-information-content";
import { SystemPromptSection } from "./components/system-prompt-section";
import { DocumentSection } from "./components/document-section";
import { WhatsAppSection } from "./components/whatsapp-section";
import { ChatSection } from "./components/chat-section";
import {
  Info,
  Settings,
  FileText,
  MessageSquare,
  MessageCircle,
} from "lucide-react";

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
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">
                        {selectedAgent.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content Area with Tabs */}
        <div className="flex-1 p-6">
          {!selectedAgent ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                  Select an Agent
                </h2>
                <p className="text-muted-foreground">
                  Choose an agent from the sidebar to manage its settings.
                </p>
              </div>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger
                  value="agent-info"
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  Agent Info
                </TabsTrigger>
                <TabsTrigger
                  value="system-prompt"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  System Prompt
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="whatsapp"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agent-info" className="mt-6">
                <BasicInformationContent />
              </TabsContent>

              <TabsContent value="system-prompt" className="mt-6">
                <SystemPromptSection />
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <DocumentSection />
              </TabsContent>

              <TabsContent value="whatsapp" className="mt-6">
                <WhatsAppSection />
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <ChatSection />
              </TabsContent>
            </Tabs>
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
