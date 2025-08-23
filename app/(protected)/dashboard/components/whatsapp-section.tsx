// Komponen stateless untuk menampilkan pengaturan WhatsApp agent
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, CheckCircle, XCircle } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { AddDeviceDialog } from "./add-device-dialog";

// Types for session data
interface SessionData {
  qr: string;
  session: string;
  apikey: string;
  device?: any;
}

// Props interface for WhatsAppSection
interface WhatsAppSectionProps {
  isConnected: boolean;
  isLoading: boolean;
  qrData: string | null;
  sessionData: SessionData | null;
  error: string | null;
  phoneNumber: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function WhatsAppSection({
  isConnected,
  isLoading,
  qrData,
  sessionData,
  error,
  phoneNumber,
  onConnect,
  onDisconnect,
}: WhatsAppSectionProps) {
  const { selectedAgent } = useAgent();

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-1">Select an Agent</h2>
          <p className="text-sm text-muted-foreground">
            Choose an agent to view WhatsApp settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp Connection</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="text-xs"
          >
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

        {/* Phone Number */}
        {phoneNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Phone Number</span>
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-mono">{phoneNumber}</span>
            </div>
          </div>
        )}

        {/* Connection Button */}
        <AddDeviceDialog
          isConnected={isConnected}
          isLoading={isLoading}
          qrData={qrData}
          sessionData={sessionData}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          disabled={Boolean(!selectedAgent?.id)}
        />

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
