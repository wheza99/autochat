// Komponen untuk mengelola pengaturan WhatsApp agent
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Phone, CheckCircle, XCircle, Settings, QrCode } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { useState } from "react";

export function WhatsAppSection() {
  const { selectedAgent } = useAgent();
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-1">Select an Agent</h2>
          <p className="text-sm text-muted-foreground">Choose an agent to view WhatsApp settings</p>
        </div>
      </div>
    );
  }

  const isConnected = selectedAgent.phone ? true : false;
  const phoneNumber = selectedAgent.phone ? selectedAgent.phone.replace('@s.whatsapp.net', '') : null;

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
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp Connection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
          
          {phoneNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Phone Number</span>
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-mono">{phoneNumber}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
          <CardDescription className="text-xs">
            Manage your WhatsApp bot connection and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs h-8"
            disabled={!isConnected}
          >
            <MessageCircle className="h-3 w-3 mr-2" />
            Send Test Message
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs h-8"
          >
            <Settings className="h-3 w-3 mr-2" />
            Configure Webhook
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs h-8"
                onClick={generateQRCode}
                disabled={isLoading}
              >
                <QrCode className="h-3 w-3 mr-2" />
                {isLoading ? 'Generating...' : 'Show QR Code'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>WhatsApp QR Code</DialogTitle>
                <DialogDescription>
                  Scan this QR code with your WhatsApp mobile app to connect your bot.
                </DialogDescription>
              </DialogHeader>
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
                      <p className="text-sm text-muted-foreground">Click "Show QR Code" to generate</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant={isConnected ? "destructive" : "default"} 
            size="sm" 
            className="w-full justify-start text-xs h-8"
          >
            {isConnected ? (
              <>
                <XCircle className="h-3 w-3 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 mr-2" />
                Connect WhatsApp
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Message Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">Messages Sent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">0</div>
              <div className="text-xs text-muted-foreground">Messages Received</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">0</div>
              <div className="text-xs text-muted-foreground">Active Chats</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">0</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}