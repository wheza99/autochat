"use client";

import React from "react";
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
import { useAgent } from "@/contexts/agent-context";
import { WhatsAppConnectionStatus } from "./whatsapp-connection-status";
import { QRCodeGenerator } from "./qr-code-generator";

// Device Data Context
const DeviceDataContext = React.createContext<{
  refreshDeviceData: () => void;
  setRefreshDeviceData: (fn: () => void) => void;
  refreshQRGenerator: () => void;
  setRefreshQRGenerator: (fn: () => void) => void;
}>({
  refreshDeviceData: () => {},
  setRefreshDeviceData: () => {},
  refreshQRGenerator: () => {},
  setRefreshQRGenerator: () => {},
});

export { DeviceDataContext };

// Main Dashboard Content
export function WhatsAppContent() {
  const { selectedAgent, agents } = useAgent();
  const [refreshDeviceDataFn, setRefreshDeviceDataFn] = React.useState<
    () => void
  >(() => () => {});
  const [refreshQRGeneratorFn, setRefreshQRGeneratorFn] = React.useState<
    () => void
  >(() => () => {});

  const contextValue = {
    refreshDeviceData: refreshDeviceDataFn,
    setRefreshDeviceData: (fn: () => void) => {
      setRefreshDeviceDataFn(() => fn);
    },
    refreshQRGenerator: refreshQRGeneratorFn,
    setRefreshQRGenerator: (fn: () => void) => {
      setRefreshQRGeneratorFn(() => fn);
    },
  };

  // Get current agent name for breadcrumb
  const currentAgentName = selectedAgent
    ? selectedAgent.name
    : agents.length > 0
    ? agents[0].name
    : "No Agent";

  return (
    <DeviceDataContext.Provider value={contextValue}>
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
                    <BreadcrumbLink href="/dashboard">
                      {currentAgentName}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>WhatsApp</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  WhatsApp Management
                </h1>
                <p className="text-muted-foreground">
                  Connect and manage your WhatsApp account
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <WhatsAppConnectionStatus />
              <QRCodeGenerator />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DeviceDataContext.Provider>
  );
}
