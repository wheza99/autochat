// Sidebar kanan yang menampilkan dashboard agent dan dokumen
import * as React from "react";
import { AgentHeader } from "./agent-header";
import { BasicInformationContent } from "./basic-information-content";
import { DocumentSection } from "./document-section";
import { WhatsAppSection } from "./whatsapp-section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Settings, FileText, MessageCircle } from "lucide-react";



export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex w-[320px]"
      {...props}
    >
      <SidebarContent className="pt-2">
        <div className="px-2">
          <AgentHeader />
        </div>
        <div className="px-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Info
                </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Docs
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-1">
              <BasicInformationContent />
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <DocumentSection />
            </TabsContent>
            <TabsContent value="whatsapp" className="mt-4">
              <WhatsAppSection />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
