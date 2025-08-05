"use client";

import { AppSidebar } from "@/components/shadcn-blocks/sidebar-08/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AgentProvider } from "@/contexts/agent-context";
import { ChatInterface } from "@/components/chat-interface";
import { DocumentSidebar } from "@/components/document-sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SidebarRight } from "./components/right-sidebar";

// Message type definition
interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Sample data untuk dokumen
const sampleDocuments = [
  { id: 1, title: "Laporan Keuangan Q1 2024", type: "PDF", date: "2024-03-15" },
  { id: 2, title: "Proposal Proyek Urbana", type: "DOCX", date: "2024-03-10" },
  { id: 3, title: "Analisis Pasar", type: "XLSX", date: "2024-03-08" },
  { id: 4, title: "Rencana Strategis 2024", type: "PDF", date: "2024-03-05" },
  { id: 5, title: "Data Survei Pelanggan", type: "CSV", date: "2024-03-01" },
  {
    id: 6,
    title: "Presentasi Board Meeting",
    type: "PPTX",
    date: "2024-02-28",
  },
];

// Sample data untuk chat messages
const sampleMessages: Message[] = [
  {
    id: 1,
    type: "user" as const,
    content:
      "Halo, bisakah Anda membantu saya menganalisis laporan keuangan Q1?",
    timestamp: "10:30",
  },
  {
    id: 2,
    type: "assistant" as const,
    content:
      "Tentu! Saya dapat membantu Anda menganalisis laporan keuangan Q1 2024. Berdasarkan dokumen yang tersedia, saya melihat ada laporan keuangan Q1 2024 dalam format PDF. Apakah ada aspek tertentu yang ingin Anda fokuskan dalam analisis ini?",
    timestamp: "10:31",
  },
  {
    id: 3,
    type: "user" as const,
    content: "Saya ingin fokus pada tren pendapatan dan profitabilitas.",
    timestamp: "10:32",
  },
];

export default function Page() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [sessionId, setSessionId] = useState<string>("");

  // Generate session ID on component mount
  useEffect(() => {
    const generateSessionId = () => {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    setSessionId(generateSessionId());
  }, []);

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
    <AgentProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Agent Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Agents Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* Main Content Area - Chat Interface */}
          <div className="flex flex-1 h-[calc(100vh-4rem)]">
            <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
            <DocumentSidebar documents={sampleDocuments} />
          </div>
        </SidebarInset>
        <SidebarRight/>
      </SidebarProvider>
    </AgentProvider>
  );
}
