// Komponen untuk menampilkan daftar pesan chat dengan scroll
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-70 mt-2 block">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}