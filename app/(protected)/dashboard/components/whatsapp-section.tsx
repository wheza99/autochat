// Komponen untuk mengelola pengaturan WhatsApp agent
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Phone,
  CheckCircle,
  XCircle,
  QrCode,
} from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// Types for session data
interface SessionData {
  qr: string;
  session: string;
  apikey: string;
  device?: any;
}

interface DeviceStatus {
  id: string;
  api_key: string | null;
  session: string | null;
  is_active: boolean;
  phone_number?: string | null;
  status_session?: string;
}

export function WhatsAppSection() {
  const { selectedAgent } = useAgent();
  const { user } = useAuth();
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Load device status from database
  const loadDeviceStatus = useCallback(async () => {
    if (!user?.id || !selectedAgent?.id) return;

    try {
      const { data: device } = await supabase
        .from("device")
        .select("*")
        .eq("user_id", user.id)
        .eq("agent_id", selectedAgent.id)
        .eq("device_type", "whatsapp")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (device) {
        setDeviceStatus(device);

        // If device has API key, check session status
        if (device.api_key) {
          checkSessionStatus(device.api_key);
        }
      } else {
        setDeviceStatus(null);
      }
    } catch (error) {
      console.error("Error loading device status:", error);
      setDeviceStatus(null);
    }
  }, [user?.id, selectedAgent?.id]);

  // Check session status from notif.my.id
  const checkSessionStatus = async (apiKey: string) => {
    if (isCheckingStatus) return;

    setIsCheckingStatus(true);
    try {
      const credentials = btoa("wheza99@gmail.com:b4ZXVkenVp7xMPe");
      const response = await fetch("https://app.notif.my.id/ss/info", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apikey: apiKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setDeviceStatus((prev) =>
          prev
            ? {
                ...prev,
                status_session: data.status_session,
                phone_number: data.phone_number,
              }
            : null
        );

        // Update agent phone if connected and different
        if (
          data.status_session === "online" &&
          data.phone_number &&
          selectedAgent &&
          selectedAgent.phone !== data.phone_number
        ) {
          // Update agent phone in database
          await supabase
            .from("agents")
            .update({ phone: data.phone_number })
            .eq("id", selectedAgent.id);
        }
      }
    } catch (error) {
      console.error("Error checking session status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Load device status on component mount and when dependencies change
  useEffect(() => {
    loadDeviceStatus();
  }, [loadDeviceStatus]);

  // Poll session status every 30 seconds if device has API key
  useEffect(() => {
    if (!deviceStatus?.api_key) return;

    const interval = setInterval(() => {
      checkSessionStatus(deviceStatus.api_key!);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [deviceStatus?.api_key, isCheckingStatus]);

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

  // Determine connection status from device status or agent phone
  const isConnected =
    deviceStatus?.status_session === "online" ||
    (deviceStatus?.api_key && deviceStatus?.phone_number) ||
    selectedAgent.phone;

  const phoneNumber =
    deviceStatus?.phone_number ||
    (selectedAgent.phone
      ? selectedAgent.phone.replace("@s.whatsapp.net", "")
      : null);

  const generateQRCode = async () => {
    if (!user?.id || !selectedAgent?.id) {
      setError("User or agent not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/device/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          agentId: selectedAgent.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrData(data.qr);
        setSessionData(data);
        setError(null);

        // Reload device status after successful QR generation
        setTimeout(() => {
          loadDeviceStatus();
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate QR code");
        console.error("Failed to generate QR code:", errorData);
      }
    } catch (error) {
      setError("Network error occurred");
      console.error("Error generating QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect device
  const disconnectDevice = async () => {
    if (!deviceStatus?.api_key) return;

    setIsLoading(true);
    try {
      // Delete API key from notifikasee
      const credentials = btoa("wheza99@gmail.com:b4ZXVkenVp7xMPe");
      await fetch("https://app.notif.my.id/ss/delete", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apikey: deviceStatus.api_key }),
      });

      // Clear device data from Supabase
      await supabase
        .from("device")
        .update({
          api_key: null,
          session: null,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deviceStatus.id);

      // Clear agent phone
      if (selectedAgent) {
        await supabase
          .from("agents")
          .update({ phone: null })
          .eq("id", selectedAgent.id);
      }

      // Reload device status
      loadDeviceStatus();
      setQrData(null);
      setSessionData(null);
    } catch (error) {
      console.error("Error disconnecting device:", error);
      setError("Failed to disconnect device");
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
              <span className="text-sm text-muted-foreground">
                Phone Number
              </span>
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-mono">{phoneNumber}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
              {error}
            </div>
          )}

          {/* Connection Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={isConnected ? disconnectDevice : generateQRCode}
                disabled={isLoading || !user?.id || !selectedAgent?.id}
              >
                {isConnected ? (
                  <>
                    <XCircle className="h-3 w-3 mr-2" />
                    {isLoading ? "Disconnecting..." : "Disconnect"}
                  </>
                ) : (
                  <>
                    <QrCode className="h-3 w-3 mr-2" />
                    {isLoading ? "Generating..." : "Connect Whatsapp"}
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>WhatsApp QR Code</DialogTitle>
                <DialogDescription>
                  Scan this QR code with your WhatsApp mobile app to connect
                  your bot.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                {qrData ? (
                  <>
                    <div className="p-4 bg-white rounded-lg border">
                      <Image
                        src={qrData}
                        alt="WhatsApp QR Code"
                        width={256}
                        height={256}
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    {sessionData && (
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Session:{" "}
                          <span className="font-mono text-xs">
                            {sessionData.session}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          API Key:{" "}
                          <span className="font-mono text-xs">
                            {sessionData.apikey}
                          </span>
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <QrCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click &quot;Show QR Code&quot; to generate
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
