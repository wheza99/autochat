// Komponen navigasi agent list di sidebar
"use client";

import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAgent } from "@/contexts/agent-context";
import type { Agent } from "@/contexts/agent-context";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavAgents() {
  const { agents, selectedAgent, setSelectedAgent } = useAgent();
  const router = useRouter();

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    router.push(`/dashboard?agent_id=${agent.id}`);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Agents</SidebarGroupLabel>
      <SidebarMenu>
        {agents.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="gap-2">
              <Bot className="size-4 shrink-0" />
              <span className="text-muted-foreground">No agents found</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          agents.map((agent) => (
            <SidebarMenuItem key={agent.id}>
              <SidebarMenuButton
                onClick={() => handleAgentClick(agent)}
                isActive={selectedAgent?.id === agent.id}
                className="gap-2"
              >
                <Bot className="size-4 shrink-0" />
                <span>{agent.name || "Unnamed Agent"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
