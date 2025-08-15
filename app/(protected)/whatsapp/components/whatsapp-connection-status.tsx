"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { DeviceDataContext } from "./whatsapp-content";

// Types for device and session data
interface DeviceData {
  id: string;
  user_id: string;
  agent_id: string;
  api_key: string;
  session_name: string;
  created_at: string;
  updated_at: string;
  last_active?: string;
}

interface ConnectionInfo {
  phone?: string;
  session?: string;
  api_key?: string;
  status?: string;
  bot_number?: string;
  [key: string]: unknown;
}

// WhatsApp Connection Status Component
export function WhatsAppConnectionStatus() {
  const { user } = useAuth();
  const { selectedAgent } = useAgent();
  const { setRefreshDeviceData, refreshQRGenerator } =
    React.useContext(DeviceDataContext);
  const [, setIsConnected] = React.useState(false);
  const [connectionInfo, setConnectionInfo] =
    React.useState<ConnectionInfo | null>(null);
  const [deviceData, setDeviceData] = React.useState<DeviceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sessionStatus, setSessionStatus] = React.useState<string | null>(null);
  const [botNumber, setBotNumber] = React.useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Check session status using API
  const checkSessionStatus = React.useCallback(async (apiKey: string) => {
    if (!apiKey) {
      setSessionStatus("invalid");
      return;
    }

    setIsCheckingStatus(true);
    try {
      const credentials = btoa("wheza99@gmail.com:b4ZXVkenVp7xMPe");
      const response = await fetch("https://app.notif.my.id/ss/info", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: apiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data.status_session || "offline");
        setBotNumber(data.bot_number || "N/A");
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error?.message?.includes("Invalid apikey")) {
          setSessionStatus("invalid");
        } else {
          setSessionStatus("offline");
        }
      }
    } catch (error) {
      console.error("Error checking session status:", error);
      setSessionStatus("offline");
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // Load device data from Supabase based on selected agent
  const loadDeviceData = React.useCallback(async () => {
    if (!user?.id || !selectedAgent?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("device")
        .select("*")
        .eq("user_id", user.id)
        .eq("agent_id", selectedAgent.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error loading device data:", error);
      } else if (data) {
        setDeviceData(data);
        setConnectionInfo({
          phone: data.phone_number,
          session: data.session,
          api_key: data.api_key,
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
      console.error("Error loading device data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedAgent?.id, checkSessionStatus]);

  // Delete device function
  const deleteDevice = React.useCallback(async () => {
    if (!deviceData?.api_key || !user?.id || !selectedAgent?.id) {
      return;
    }

    setIsDeleting(true);
    try {
      // First, try to delete from notifikasee
      const credentials = btoa("wheza99@gmail.com:b4ZXVkenVp7xMPe");
      try {
        const response = await fetch("https://app.notif.my.id/ss/delete", {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apikey: deviceData.api_key,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Device deleted from notifikasee:", data.message);
        } else {
          const errorData = await response.json().catch(() => null);
          if (errorData?.error?.message?.includes("Invalid apikey")) {
            console.log("API key already deleted or invalid in notifikasee");
          } else {
            console.error("Failed to delete from notifikasee:", errorData);
          }
        }
      } catch (error) {
        console.error("Error deleting from notifikasee:", error);
        // Continue with Supabase deletion even if notifikasee fails
      }

      // Delete from Supabase
      const { error: supabaseError } = await supabase
        .from("device")
        .delete()
        .eq("user_id", user.id)
        .eq("agent_id", selectedAgent.id)
        .eq("api_key", deviceData.api_key);

      if (supabaseError) {
        console.error("Error deleting from Supabase:", supabaseError);
        throw supabaseError;
      }

      console.log("Device deleted from Supabase successfully");

      // Reset local state
      setDeviceData(null);
      setConnectionInfo(null);
      setIsConnected(false);
      setSessionStatus(null);
      setBotNumber(null);

      // Refresh QR generator
      refreshQRGenerator();
    } catch (error) {
      console.error("Error deleting device:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [deviceData, user?.id, selectedAgent?.id, refreshQRGenerator]);

  // Load device data when component mounts or dependencies change
  React.useEffect(() => {
    loadDeviceData();
    // Register this component's refresh function with the context
    setRefreshDeviceData(loadDeviceData);
  }, [loadDeviceData, setRefreshDeviceData]);

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
            <span className="ml-2 text-sm text-muted-foreground">
              Loading...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sessionStatus === "online" ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            WhatsApp Connection Status
          </div>
          {deviceData && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  // First refresh the QR generator to close QR and check status
                  refreshQRGenerator();
                  // Also check session status to update the connection status display
                  if (deviceData?.api_key) {
                    await checkSessionStatus(deviceData.api_key);
                  }
                }}
                disabled={isCheckingStatus || isDeleting}
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isCheckingStatus ? "animate-spin" : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteDevice}
                disabled={isCheckingStatus || isDeleting}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2
                  className={`h-4 w-4 ${isDeleting ? "animate-pulse" : ""}`}
                />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deviceData && connectionInfo ? (
          <div className="space-y-3">
            <Badge
              variant={sessionStatus === "online" ? "default" : "secondary"}
              className={
                sessionStatus === "online"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }
            >
              {sessionStatus === "online" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>

            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Phone Number
                </p>
                <p className="text-sm font-mono">
                  {(botNumber && botNumber.split("@")[0]) || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Session ID
                </p>
                <p className="text-sm font-mono break-all">
                  {connectionInfo.session || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  API Key
                </p>
                <p className="text-sm font-mono break-all">
                  {connectionInfo.api_key || "N/A"}
                </p>
              </div>

              {deviceData.last_active && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Last Active
                  </p>
                  <p className="text-sm">
                    {new Date(deviceData.last_active).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Session Status Display */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Session Status:
                </span>
                <div className="flex items-center gap-2">
                  {isCheckingStatus ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">
                        Checking...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Badge
                        variant={
                          sessionStatus === "online" ? "default" : "secondary"
                        }
                        className={
                          sessionStatus === "online"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : sessionStatus === "offline"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {sessionStatus === "online" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {sessionStatus === "offline" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {sessionStatus === "invalid" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {sessionStatus || "Unknown"}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              {sessionStatus === "online" && (
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ WhatsApp is connected and active. No need to generate new
                  QR code.
                </p>
              )}
              {sessionStatus === "offline" && (
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Session is offline. You can generate a new QR code to
                  reconnect.
                </p>
              )}
              {sessionStatus === "invalid" && (
                <p className="text-xs text-muted-foreground mt-2">
                  ❌ API key is invalid. Please generate a new QR code.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-800 border-gray-200"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              No Device Found
            </Badge>
            <p className="text-sm text-muted-foreground">
              {!selectedAgent
                ? "Please select an agent first"
                : "No WhatsApp device connected for this agent"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
