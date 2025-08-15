"use client";

import { AgentProvider } from "@/contexts/agent-context";
import { WhatsAppContent } from "./components/whatsapp-content";

// Main Page Component
export default function WhatsAppPage() {
  return (
    <AgentProvider>
      <WhatsAppContent />
    </AgentProvider>
  );
}
