// Halaman dashboard utama dengan tabs dan sidebar
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Settings, FileText, MessageCircle } from "lucide-react";
import { AgentProvider } from "@/contexts/agent-context";
import { BasicInformationContent } from "./components/basic-information-content";
import { DocumentSection } from "./components/document-section";
import { WhatsAppSection } from "./components/whatsapp-section";

import { SidebarRight } from "./components/right-sidebar";

// Message type definition




// Inner component that uses the agent context
function DashboardContent() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Agent Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content Area - Tabs */}
        <div className="flex-1 p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Info</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-3">
              <BasicInformationContent />
            </TabsContent>
            <TabsContent value="documents" className="mt-3">
              <DocumentSection />
            </TabsContent>
            <TabsContent value="whatsapp" className="mt-3">
              <WhatsAppSection />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <AgentProvider>
      <DashboardContent />
    </AgentProvider>
  );
}
