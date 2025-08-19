"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface Agent {
  id: string;
  name: string;
  phone: string | null;
  system_prompt: string | null;
  model: string | null;
  created_at: string;
  updated_at: string | null;
  api_key: string | null;
  user_id: string | null;
}

interface AgentContextType {
  agents: Agent[];
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  updateAgent: (updatedData: Partial<Agent>) => void;
  loadAgents: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { user } = useAuth();

  const loadAgents = async () => {
    try {
      if (!user?.id) {
        setAgents([]);
        return;
      }

      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading agents:", error);
        return;
      }

      if (data) {
        setAgents(data);
      }
    } catch (error) {
      console.error("Unexpected error loading agents:", error);
    }
  };

  const updateAgent = (updatedData: Partial<Agent>) => {
    if (selectedAgent) {
      const updatedAgent = { ...selectedAgent, ...updatedData };
      setSelectedAgent(updatedAgent);

      // Also update in the agents list
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.id === updatedAgent.id ? updatedAgent : agent
        )
      );
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAgents();
    } else {
      setAgents([]);
      setSelectedAgent(null);
    }
  }, [user?.id]);

  // Auto-select first agent when agents are loaded and no agent is selected
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  return (
    <AgentContext.Provider
      value={{
        agents,
        selectedAgent,
        setSelectedAgent,
        updateAgent,
        loadAgents,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}
