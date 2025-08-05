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
import { FileText, Plus, Search, Upload, Download, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAgent } from "@/contexts/agent-context";
import { supabase } from "@/lib/supabase";
import { AgentDashboard } from "./agent-dashboard";

// Interface untuk dokumen dari database
interface Document {
  id: string;
  name: string | null;
  url: string | null;
  file_path: string | null;
  mime_type: string | null;
  agent_id: string | null;
  created_at: string;
}

export function DocumentSection() {
  const { selectedAgent } = useAgent();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      if (!selectedAgent) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('storage_documents')
        .select('*')
        .eq('agent_id', selectedAgent.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedAgent]);

  // Helper function to get file type from mime_type or file name
  const getFileType = (mimeType: string | null, fileName: string | null): string => {
    if (mimeType) {
      if (mimeType.includes('pdf')) return 'PDF';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'DOCX';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'XLSX';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPTX';
      if (mimeType.includes('text')) return 'TXT';
      if (mimeType.includes('csv')) return 'CSV';
    }
    
    if (fileName) {
      const extension = fileName.split('.').pop()?.toUpperCase();
      return extension || 'FILE';
    }
    
    return 'FILE';
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

                  // Save document metadata to database first to get storage_document_id
                  const { data: documentData, error: dbError } = await supabase
                    .from('storage_documents')
                    .insert({
                      name: file.name,
                      url: urlData.publicUrl,
                      file_path: fileName,
                      mime_type: file.type
                    })
                    .select()
                    .single();

                  if (dbError) {
                    console.error('Error saving to database:', dbError);
                    alert('Gagal menyimpan metadata ke database');
                    // Delete uploaded file from storage if database save fails
                    await supabase.storage.from("documents").remove([fileName]);
                    return;
                  }

                  // Now send to n8n with file URL, storage_document_id, and agent_id
                  const uploadFormData = new FormData();
                  uploadFormData.append("file", file);
                  uploadFormData.append("supabase_url", urlData.publicUrl);
                  uploadFormData.append("file_name", fileName);
                  uploadFormData.append("storage_document_id", documentData.id);
                  uploadFormData.append("agent_id", selectedAgent?.id || "");

                  const response = await fetch(
                    "https://n8n.wheza.id/webhook-test/andy-update-rag",
                    {
                      method: "POST",
                      body: uploadFormData,
                    }
                  );

                  if (response.ok) {
                    alert("File berhasil diupload dan disimpan!");
                    // Refresh documents list
                    fetchDocuments();
                    
                    // Reset form safely
                    const form = e.currentTarget;
                    if (form) {
                      form.reset();
                    }
                    // Close dialog
                    setIsDialogOpen(false);
                  } else {
                    alert("Gagal mengupload file ke n8n");
                    // Delete from database and storage if n8n fails
                    await supabase.from('storage_documents').delete().eq('id', documentData.id);
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Memuat dokumen...</div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">
                {searchTerm ? 'Tidak ada dokumen yang ditemukan' : 'Belum ada dokumen'}
              </div>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="hover:bg-accent transition-colors"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {doc.name || 'Dokumen Tanpa Nama'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          {getFileType(doc.mime_type, doc.name)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (doc.url) {
                            window.open(doc.url, '_blank');
                          }
                        }}
                        title="Lihat dokumen"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (doc.url && doc.name) {
                            try {
                              const response = await fetch(doc.url);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.style.display = 'none';
                              a.href = url;
                              a.download = doc.name;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              console.error('Error downloading file:', error);
                              alert('Gagal mendownload file');
                            }
                          }
                        }}
                        title="Download dokumen"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
                            try {
                              // Delete from Supabase storage
                              if (doc.file_path) {
                                const { error: storageError } = await supabase.storage
                                  .from('documents')
                                  .remove([doc.file_path]);
                                
                                if (storageError) {
                                  console.error('Error deleting from storage:', storageError);
                                }
                              }
                              
                              // Delete from database
                              const { error: dbError } = await supabase
                                .from('storage_documents')
                                .delete()
                                .eq('id', doc.id);
                              
                              if (dbError) {
                                console.error('Error deleting from database:', dbError);
                                alert('Gagal menghapus dokumen dari database');
                              } else {
                                alert('Dokumen berhasil dihapus!');
                                // Refresh documents list
                                fetchDocuments();
                              }
                            } catch (error) {
                              console.error('Error deleting document:', error);
                              alert('Terjadi kesalahan saat menghapus dokumen');
                            }
                          }
                        }}
                        title="Hapus dokumen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
