// Komponen Chat Section untuk dashboard
"use client";

import React from "react";
import ChatInterface from "@/components/chat/chat-interface";
import { useAgent } from "@/contexts/agent-context";

export function ChatSection() {
  const { selectedAgent } = useAgent();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">
            Chat with{" "}
            <span className="font-medium">
              {selectedAgent ? selectedAgent.name : "your agent"}
            </span>
          </p>
        </div>
      </div>
      
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
}