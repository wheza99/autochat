"use client";

import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Messages */}
      <ChatMessages messages={messages} />

      {/* Chat Input */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}