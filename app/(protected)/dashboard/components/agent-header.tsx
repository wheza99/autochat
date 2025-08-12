// Komponen header untuk menampilkan informasi dasar agent
"use client";

import { Bot } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAgent } from "@/contexts/agent-context";

export function AgentHeader() {
  const { selectedAgent } = useAgent();

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="text-center">
          <Bot className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
          <h2 className="text-sm font-semibold mb-1">Select an Agent</h2>
          <p className="text-xs text-muted-foreground">Choose an agent from the sidebar</p>
        </div>
      </div>
    );
  }

  const agent = selectedAgent;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold truncate">{agent.name || 'Unnamed Agent'}</h1>
            <p className="text-xs text-muted-foreground truncate">ID: {agent.id.slice(0, 8)}...</p>
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
}