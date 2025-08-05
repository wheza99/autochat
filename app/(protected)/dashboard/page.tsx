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
import { AgentDashboard } from "@/components/agent-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Send, Plus, Search, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

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
const sampleMessages = [
  {
    id: 1,
    type: "user",
    content:
      "Halo, bisakah Anda membantu saya menganalisis laporan keuangan Q1?",
    timestamp: "10:30",
  },
  {
    id: 2,
    type: "assistant",
    content:
      "Tentu! Saya dapat membantu Anda menganalisis laporan keuangan Q1 2024. Berdasarkan dokumen yang tersedia, saya melihat ada laporan keuangan Q1 2024 dalam format PDF. Apakah ada aspek tertentu yang ingin Anda fokuskan dalam analisis ini?",
    timestamp: "10:31",
  },
  {
    id: 3,
    type: "user",
    content: "Saya ingin fokus pada tren pendapatan dan profitabilitas.",
    timestamp: "10:32",
  },
];

export default function Page() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [messages, setMessages] = useState(sampleMessages);
  const [sessionId, setSessionId] = useState<string>("");

  // Generate session ID on component mount
  useEffect(() => {
    const generateSessionId = () => {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    setSessionId(generateSessionId());
  }, []);

  const filteredDocuments = sampleDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
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

      setMessage("");
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
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
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

              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ketik pesan Anda..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Documents */}
            <div className="w-80 border-l bg-muted/30">
              <AgentDashboard />

              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Dokumen</h3>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const file = formData.get("file") as File;

                          if (!file || file.size === 0) {
                            alert("Silakan pilih file terlebih dahulu");
                            return;
                          }

                          try {
                            // Generate unique filename
                            const timestamp = Date.now();
                            const fileExtension = file.name.split('.').pop();
                            const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                            // Upload to Supabase Storage first
                            const { data: uploadData, error: uploadError } = await supabase.storage
                              .from('documents')
                              .upload(fileName, file, {
                                cacheControl: '3600',
                                upsert: false
                              });

                            if (uploadError) {
                              console.error('Supabase upload error:', uploadError);
                              alert('Gagal menyimpan file ke storage');
                              return;
                            }

                            // Get public URL from Supabase
                            const { data: urlData } = supabase.storage
                              .from('documents')
                              .getPublicUrl(fileName);

                            // Now send to n8n with file URL
                            const uploadFormData = new FormData();
                            uploadFormData.append("file", file);
                            uploadFormData.append("supabase_url", urlData.publicUrl);
                            uploadFormData.append("file_name", fileName);

                            const response = await fetch(
                              "https://n8n.wheza.id/webhook-test/andy-update-rag",
                              {
                                method: "POST",
                                body: uploadFormData,
                              }
                            );

                            if (response.ok) {
                              alert("File berhasil diupload dan disimpan!");
                              // Reset form safely
                              const form = e.currentTarget;
                              if (form) {
                                form.reset();
                              }
                              // Close dialog
                              setIsDialogOpen(false);
                            } else {
                              alert("Gagal mengupload file ke n8n");
                              // Optionally delete from Supabase if n8n fails
                              await supabase.storage.from('documents').remove([fileName]);
                            }
                          } catch (error) {
                            console.error("Error uploading file:", error);
                            alert("Terjadi kesalahan saat mengupload file");
                          }
                        }}
                      >
                        <DialogHeader>
                          <DialogTitle>Upload Dokumen</DialogTitle>
                          <DialogDescription>
                            Pilih file yang ingin Anda upload ke sistem RAG.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid gap-3">
                            <Label htmlFor="file-upload">File</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="file-upload"
                                name="file"
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
                                className="cursor-pointer"
                              />
                              <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Format yang didukung: PDF, DOC, DOCX, TXT, CSV,
                              XLSX, PPTX
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                          </DialogClose>
                          <Button type="submit">Upload File</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari dokumen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-4 space-y-2">
                  {filteredDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {doc.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                                {doc.type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {doc.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AgentProvider>
  );
}
