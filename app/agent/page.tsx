"use client";

import React, { useState, useEffect } from 'react'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { useAuth } from '@/hooks/use-auth'
import { useAgent } from '@/contexts/agent-context'
import { AgentProvider } from '@/contexts/agent-context'
import { AuthProvider } from '@/components/auth-provider'

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

function ChatInterface() {
  const { user } = useAuth();
  const { selectedAgent } = useAgent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");

  // Generate session ID on component mount
  useEffect(() => {
    const generateSessionId = () => {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    setSessionId(generateSessionId());
  }, []);

  // Reset messages and generate new session ID when selectedAgent changes
  useEffect(() => {
    if (selectedAgent) {
      setMessages([]);
      const generateSessionId = () => {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      };
      setSessionId(generateSessionId());
    }
  }, [selectedAgent]);

  const handleSendMessage = async (message: string) => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: "user" as const,
        content: message,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);

      // Hit webhook URL
      try {
        const response = await fetch(
          "https://n8n.wheza.id/webhook-test/andy-flutterflow",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: message,
              timestamp: new Date().toISOString(),
              user: {
                id: user?.id || "anonymous",
                email: user?.email || "no-email",
                name:
                  user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  user?.email?.split("@")[0] ||
                  "Anonymous User",
              },
              sessionId: sessionId,
              phone: selectedAgent?.phone || null,
            }),
          }
        );

        if (response.ok) {
          try {
            const responseText = await response.text();
            console.log("Raw response:", responseText);

            if (responseText.trim() === "") {
              console.log("Empty response received");
              const errorMessage = {
                id: messages.length + 2,
                type: "assistant" as const,
                content:
                  "Maaf, tidak ada respons dari server. Silakan coba lagi.",
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              setMessages((prevMessages) => [...prevMessages, errorMessage]);
              return;
            }

            const responseData = JSON.parse(responseText);
            console.log("Webhook berhasil dipanggil", responseData);

            // Add assistant response to chat
            if (responseData && responseData.output) {
              const assistantMessage = {
                id: messages.length + 2,
                type: "assistant" as const,
                content: responseData.output,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              setMessages((prevMessages) => [
                ...prevMessages,
                assistantMessage,
              ]);
            } else if (
              responseData &&
              Array.isArray(responseData) &&
              responseData.length > 0 &&
              responseData[0].output
            ) {
              const assistantMessage = {
                id: messages.length + 2,
                type: "assistant" as const,
                content: responseData[0].output,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              setMessages((prevMessages) => [
                ...prevMessages,
                assistantMessage,
              ]);
            } else {
              const errorMessage = {
                id: messages.length + 2,
                type: "assistant" as const,
                content:
                  "Maaf, format respons tidak sesuai. Silakan coba lagi.",
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              setMessages((prevMessages) => [...prevMessages, errorMessage]);
            }
          } catch (jsonError) {
            console.error("JSON parsing error:", jsonError);
            const errorMessage = {
              id: messages.length + 2,
              type: "assistant" as const,
              content:
                "Maaf, terjadi kesalahan saat memproses respons. Silakan coba lagi.",
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
          }
        } else {
          console.error("Webhook gagal:", response.status);
          // Add error message to chat
          const errorMessage = {
            id: messages.length + 2,
            type: "assistant" as const,
            content:
              "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
            timestamp: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
      } catch (error) {
        console.error("Error calling webhook:", error);
        // Add error message to chat
        const errorMessage = {
          id: messages.length + 2,
          type: "assistant" as const,
          content: "Maaf, terjadi kesalahan koneksi. Silakan coba lagi.",
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col h-screen">
      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-lg">
              Halo, {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}!
            </p>
          </div>
        ) : (
          <ChatMessages messages={messages} />
        )}
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="sticky bottom-0 bg-background border-t">
        <ChatInput onSendMessage={handleSendMessage} phone={selectedAgent?.phone} />
      </div>
    </div>
  )
}

export default function Agent() {
  return (
    <AuthProvider>
      <AgentProvider>
        <ChatInterface />
      </AgentProvider>
    </AuthProvider>
  );
}
