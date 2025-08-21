// Halaman dashboard utama dengan tabs dan sidebar
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAgent } from "@/contexts/agent-context";
import { BasicInformationContent } from "./components/basic-information-content";
import { SystemPromptSection } from "./components/system-prompt-section";
import { DocumentSection } from "./components/document-section";
import { WhatsAppSection } from "./components/whatsapp-section";
import { TransactionSection } from "./components/transaction-section";

// Inner component that uses the agent context
function DashboardContent() {
  const { selectedAgent, agents, setSelectedAgent } = useAgent();
  const searchParams = useSearchParams();

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
    <>
      {/* Main Content Area with Tabs */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
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
            <div className="flex-1 lg:hidden space-y-4">
              <BasicInformationContent />
              <WhatsAppSection />
              <TransactionSection />
            </div>
            <div className="flex-2 space-y-4">
              <SystemPromptSection />
              <DocumentSection />
            </div>
            <div className="flex-1 lg:block space-y-4">
              <BasicInformationContent />
              <WhatsAppSection />
              <TransactionSection />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DashboardContent;
