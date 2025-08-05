import * as React from "react"
import { AgentDashboard } from "@/components/agent-dashboard"
import { DocumentSection } from "./document-section"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// Sample data for documents
const data = {
  documents: [
    {
      id: 1,
      title: "Laporan Keuangan Q1 2024",
      type: "PDF",
      date: "2024-03-15",
    },
    {
      id: 2,
      title: "Proposal Proyek Urbana",
      type: "DOCX",
      date: "2024-03-10",
    },
    {
      id: 3,
      title: "Analisis Pasar",
      type: "XLSX",
      date: "2024-03-08",
    },
    {
      id: 4,
      title: "Rencana Strategis 2024",
      type: "PDF",
      date: "2024-03-05",
    },
    {
      id: 5,
      title: "Data Survei Pelanggan",
      type: "CSV",
      date: "2024-03-01",
    },
  ],
}

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex w-[380px]"
      {...props}
    >

      <SidebarContent className="pt-4">
        <AgentDashboard />
        <SidebarSeparator className="mx-0" />
        <div className="px-3">
           <h3 className="text-sm font-semibold mb-2">Dokumen</h3>
           <DocumentSection documents={data.documents} />
         </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
