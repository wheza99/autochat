// Komponen input chat dengan tombol kirim pesan
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  phone?: string | null;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Ketik pesan..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        className="flex-1 text-xs"
      />
      <Button onClick={handleSendMessage} size="sm" className="px-3">
        <Send className="h-3 w-3" />
      </Button>
    </div>
  );
}