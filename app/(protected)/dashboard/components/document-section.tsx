"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
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
import { FileText, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { useAgent } from "@/contexts/agent-context";
import { supabase } from "@/lib/supabase";
import { AgentDashboard } from "./agent-dashboard";

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

export function DocumentSection() {
  const { selectedAgent } = useAgent();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredDocuments = sampleDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Dokumen</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={!selectedAgent}>
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
                  // Generate unique filename with agent folder
                  const timestamp = Date.now();
                  const fileExtension = file.name.split(".").pop();
                  const cleanFileName = `${timestamp}_${file.name.replace(
                    /[^a-zA-Z0-9.-]/g,
                    "_"
                  )}`;
                  const agentFolderName =
                    selectedAgent?.name.replace(/[^a-zA-Z0-9.-]/g, "_") ||
                    "default";
                  const fileName = `${agentFolderName}/${cleanFileName}`;

                  // Upload to Supabase Storage first
                  const { data: uploadData, error: uploadError } =
                    await supabase.storage
                      .from("documents")
                      .upload(fileName, file, {
                        cacheControl: "3600",
                        upsert: false,
                      });

                  if (uploadError) {
                    console.error("Supabase upload error:", uploadError);
                    alert("Gagal menyimpan file ke storage");
                    return;
                  }

                  // Get public URL from Supabase
                  const { data: urlData } = supabase.storage
                    .from("documents")
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
                    await supabase.storage.from("documents").remove([fileName]);
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
                    Format yang didukung: PDF, DOC, DOCX, TXT, CSV, XLSX, PPTX
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

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
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
  );
}
