// Komponen untuk mengelola pengaturan WhatsApp agent
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, CheckCircle, XCircle, Settings, Loader2, QrCode } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import Image from "next/image";

export function WhatsAppSection() {
  const { selectedAgent } = useAgent();
  const { status, isLoading, error, connect, disconnect } = useWhatsApp();

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

  const isConnected = status.isReady;
  const phoneNumber = status.clientInfo?.number;
  const clientName = status.clientInfo?.name;
  const platform = status.clientInfo?.platform;

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
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Connecting...
                </>
              ) : isConnected ? (
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
          
          {clientName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm">{clientName}</span>
            </div>
          )}
          
          {platform && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm capitalize">{platform}</span>
            </div>
          )}
          
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {!isConnected && status.qrCode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <QrCode className="h-4 w-4" />
              <span>Scan QR Code</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Scan this QR code with your WhatsApp mobile app to connect
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <Image
                src={status.qrCode}
                alt="WhatsApp QR Code"
                width={200}
                height={200}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>
      )}

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
          
          <Button 
            variant={isConnected ? "destructive" : "default"} 
            size="sm" 
            className="w-full justify-start text-xs h-8"
            onClick={isConnected ? disconnect : connect}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                {isConnected ? 'Disconnecting...' : 'Connecting...'}
              </>
            ) : isConnected ? (
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