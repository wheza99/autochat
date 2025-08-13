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
  WifiOff,
  RefreshCw
} from "lucide-react";
import { AgentProvider, useAgent } from "@/contexts/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import React from "react";

// WhatsApp Connection Status Component
function WhatsAppConnectionStatus() {
  const { user } = useAuth();
  const { selectedAgent } = useAgent();
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionInfo, setConnectionInfo] = React.useState<any>(null);
  const [deviceData, setDeviceData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [sessionStatus, setSessionStatus] = React.useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);

  // Check session status using API
  const checkSessionStatus = async (apiKey: string) => {
    if (!apiKey) {
      setSessionStatus('invalid');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const credentials = btoa('wheza99@gmail.com:b4ZXVkenVp7xMPe');
      const response = await fetch('https://app.notif.my.id/ss/info', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apikey: apiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data.status_session || 'offline');
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error?.message?.includes('Invalid apikey')) {
          setSessionStatus('invalid');
        } else {
          setSessionStatus('offline');
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error);
      setSessionStatus('offline');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Load device data from Supabase based on selected agent
  const loadDeviceData = React.useCallback(async () => {
    if (!user?.id || !selectedAgent?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('device')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_id', selectedAgent.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading device data:', error);
      } else if (data) {
        setDeviceData(data);
        setConnectionInfo({
          phone: data.phone_number,
          session: data.session,
          api_key: data.api_key
        });
        setIsConnected(data.is_active || false);
        // Check session status when device data is loaded
        checkSessionStatus(data.api_key);
      } else {
        setDeviceData(null);
        setConnectionInfo(null);
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Error loading device data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedAgent?.id]);

  // Load device data when component mounts or dependencies change
  React.useEffect(() => {
    loadDeviceData();
  }, [loadDeviceData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-gray-400" />
            WhatsApp Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {deviceData && connectionInfo ? (
          <div className="space-y-3">
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
              {isConnected ? (
                <><CheckCircle className="h-3 w-3 mr-1" />Connected</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" />Disconnected</>
              )}
            </Badge>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone Number</p>
                <p className="text-sm font-mono">{connectionInfo.phone || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Session ID</p>
                <p className="text-sm font-mono break-all">{connectionInfo.session || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Key</p>
                <p className="text-sm font-mono break-all">{connectionInfo.api_key || 'N/A'}</p>
              </div>
              
              {deviceData.last_active && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Active</p>
                  <p className="text-sm">{new Date(deviceData.last_active).toLocaleString()}</p>
                </div>
              )}
            </div>
            
            {/* Session Status Display */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Session Status:</span>
                <div className="flex items-center gap-2">
                  {isCheckingStatus ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">Checking...</span>
                    </div>
                  ) : (
                    <>
                      <Badge 
                        variant={sessionStatus === 'online' ? 'default' : 'secondary'}
                        className={
                          sessionStatus === 'online' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : sessionStatus === 'offline'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {sessionStatus === 'online' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {sessionStatus === 'offline' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {sessionStatus === 'invalid' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {sessionStatus || 'Unknown'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkSessionStatus(deviceData.api_key)}
                        disabled={isCheckingStatus}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className={`h-3 w-3 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {sessionStatus === 'online' && (
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ WhatsApp is connected and active. No need to generate new QR code.
                </p>
              )}
              {sessionStatus === 'offline' && (
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Session is offline. You can generate a new QR code to reconnect.
                </p>
              )}
              {sessionStatus === 'invalid' && (
                <p className="text-xs text-muted-foreground mt-2">
                  ❌ API key is invalid. Please generate a new QR code.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              No Device Found
            </Badge>
            <p className="text-sm text-muted-foreground">
              {!selectedAgent ? 'Please select an agent first' : 'No WhatsApp device connected for this agent'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



// QR Code Generator Component
function QRCodeGenerator() {
  const { user } = useAuth();
  const { selectedAgent } = useAgent();
  const [qrData, setQrData] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sessionData, setSessionData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = React.useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [deviceData, setDeviceData] = React.useState<any>(null);

  // Load device data from Supabase
  const loadDeviceData = React.useCallback(async () => {
    if (!user?.id || !selectedAgent?.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('device')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_id', selectedAgent.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading device data:', error);
      } else if (data) {
        setDeviceData(data);
        // Check session status when device data is loaded
        checkSessionStatus(data.api_key);
        setInitialLoad(false);
      } else {
        setDeviceData(null);
        setSessionStatus(null);
        setInitialLoad(false);
      }
    } catch (err) {
      console.error('Error loading device data:', err);
    }
  }, [user?.id, selectedAgent?.id]);

  // Check session status using API
  const checkSessionStatus = async (apiKey: string) => {
    if (!apiKey) {
      setSessionStatus('invalid');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const credentials = btoa('wheza99@gmail.com:b4ZXVkenVp7xMPe');
      const response = await fetch('https://app.notif.my.id/ss/info', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apikey: apiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data.status_session || 'offline');
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error?.message?.includes('Invalid apikey')) {
          setSessionStatus('invalid');
        } else {
          setSessionStatus('offline');
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error);
      setSessionStatus('offline');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Load device data when component mounts or dependencies change
  React.useEffect(() => {
    loadDeviceData();
  }, [loadDeviceData]);

  // Determine if generate button should be enabled
  const isGenerateEnabled = !initialLoad && (!deviceData || sessionStatus === 'offline' || sessionStatus === 'invalid');

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);
    
    // Validasi user dan agent
    if (!user?.id) {
      setError('User tidak terautentikasi');
      setIsLoading(false);
      return;
    }
    
    if (!selectedAgent?.id) {
      setError('Silakan pilih agent terlebih dahulu');
      setIsLoading(false);
      return;
    }
    
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
        console.log('QR Code generated successfully:', data);
        
        // Check if the response has an error tag
        if (data.tag === -2) {
          setError(data.message || 'Device quota exceeded. Please delete a device or upgrade subscription.');
          console.log('API returned error:', data.message);
        } else {
          // Simpan data ke Supabase terlebih dahulu
          const deviceData = {
            user_id: user.id,
            api_key: data.apikey,
            agent_id: selectedAgent.id,
            session: data.session,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: deviceRecord, error: dbError } = await supabase
            .from('device')
            .insert([deviceData])
            .select()
            .single();
          
          if (dbError) {
            console.error('Error saving device to database:', dbError);
            setError(`Gagal menyimpan data device: ${dbError.message}`);
          } else {
            console.log('Device saved to database:', deviceRecord);
            // Setelah berhasil simpan ke database, baru tampilkan QR code
            setQrData(data.qr);
            setSessionData(data);
            // Reload device data to update the status
            setTimeout(() => {
              loadDeviceData();
            }, 1000);
          }
        }
      } else {
        const errorText = await response.text();
        console.log('Failed to generate QR code - Status:', response.status, 'Response:', errorText);
        setError(`Failed to generate QR code: ${response.status} ${response.statusText}`);
        console.error('Failed to generate QR code:', errorText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('Error generating QR code:', error);
      setError(`Error generating QR code: ${errorMessage}`);
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
          disabled={isLoading || !isGenerateEnabled}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {isLoading ? 'Generating...' : 'Generate QR Code'}
        </Button>
        
        {!isGenerateEnabled && sessionStatus === 'online' && (
          <p className="text-xs text-center text-muted-foreground">
            QR code generation is disabled because the session is already online.
          </p>
        )}
        
        {(qrData || isLoading) && (
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
            ) : isLoading ? (
              <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
                  <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                </div>
              </div>
            ) : null}
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-md p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
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