// Halaman WhatsApp untuk manajemen dan monitoring agent WhatsApp
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { 
  QrCode,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { AgentProvider } from "@/contexts/agent-context";
import React from "react";

// WhatsApp Connection Status Component
function WhatsAppConnectionStatus() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionInfo, setConnectionInfo] = React.useState<any>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          WhatsApp Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected && connectionInfo ? (
          <div className="space-y-2">
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            <p className="text-sm text-muted-foreground">
              Phone: {connectionInfo.phone || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              Session: {connectionInfo.session || 'N/A'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
            <p className="text-sm text-muted-foreground">
              Please scan QR code to connect WhatsApp
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



// QR Code Generator Component
function QRCodeGenerator() {
  const [qrData, setQrData] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sessionData, setSessionData] = React.useState<any>(null);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const credentials = btoa('wheza99@gmail.com:b4ZXVkenVp7xMPe');
      const response = await fetch('https://app.notif.my.id/ss/scanorpairing', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrData(data.qr);
        setSessionData(data);
      } else {
        console.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect WhatsApp</CardTitle>
        <CardDescription>
          Generate QR code to connect your WhatsApp account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full" 
          onClick={generateQRCode}
          disabled={isLoading}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {isLoading ? 'Generating...' : 'Generate QR Code'}
        </Button>
        
        <div className="flex flex-col items-center space-y-4">
          {qrData ? (
            <>
              <div className="p-4 bg-white rounded-lg border">
                <img 
                  src={qrData} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 object-contain"
                />
              </div>
              {sessionData && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Session: <span className="font-mono text-xs">{sessionData.session}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    API Key: <span className="font-mono text-xs">{sessionData.apikey}</span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click "Generate QR Code" to generate</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



// Main Dashboard Content
function WhatsAppContent() {
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
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
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
              <h1 className="text-2xl font-bold tracking-tight">WhatsApp Management</h1>
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
  );
}

// Main Page Component
export default function WhatsAppPage() {
  return (
    <AgentProvider>
      <WhatsAppContent />
    </AgentProvider>
  );
}