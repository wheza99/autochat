"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, AlertCircle } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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

interface SessionData {
  qr: string;
  session: string;
  apikey: string;
}

// Import the context from the whatsapp-content component
import { DeviceDataContext } from "./whatsapp-content";

// QR Code Generator Component
export function QRCodeGenerator() {
  const { user } = useAuth();
  const { selectedAgent } = useAgent();
  const { refreshDeviceData, setRefreshQRGenerator } =
    React.useContext(DeviceDataContext);
  const [qrData, setQrData] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sessionData, setSessionData] = React.useState<SessionData | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = React.useState<string | null>(null);
  const [, setIsCheckingStatus] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [deviceData, setDeviceData] = React.useState<DeviceData | null>(null);

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

  // Load device data from Supabase
  const loadDeviceData = React.useCallback(async () => {
    if (!user?.id || !selectedAgent?.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("device")
        .select("*")
        .eq("user_id", user.id)
        .eq("agent_id", selectedAgent.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading device data:", error);
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
      console.error("Error loading device data:", err);
    }
  }, [user?.id, selectedAgent?.id, checkSessionStatus]);

  // Function to handle QR refresh from WhatsAppConnectionStatus
  const handleQRRefresh = React.useCallback(() => {
    // Always close QR code when refresh is called
    setQrData(null);
    setSessionData(null);
    setError(null);

    // Reload device data to get latest status
    if (deviceData?.api_key) {
      checkSessionStatus(deviceData.api_key);
    }
  }, [deviceData?.api_key, checkSessionStatus]);

  // Load device data when component mounts or dependencies change
  React.useEffect(() => {
    loadDeviceData();
    // Register refresh function with context
    setRefreshQRGenerator(handleQRRefresh);
  }, [loadDeviceData, setRefreshQRGenerator, handleQRRefresh]);

  // Listen for refresh from WhatsAppConnectionStatus and close QR if session is online
  React.useEffect(() => {
    if (sessionStatus === "online" && qrData) {
      // Close QR code when session becomes online
      setQrData(null);
      setSessionData(null);
      setError(null);
    }
  }, [sessionStatus, qrData]);

  // Determine if generate button should be enabled
  const isGenerateEnabled =
    !initialLoad &&
    sessionStatus !== "online" &&
    (!deviceData || sessionStatus === "offline" || sessionStatus === "invalid");

  // Function to delete API key from notifikasee
  const deleteApiKeyFromNotifikasee = async (apiKey: string) => {
    try {
      const credentials = btoa("wheza99@gmail.com:b4ZXVkenVp7xMPe");
      const response = await fetch("https://app.notif.my.id/ss/delete", {
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
        console.log("API key deleted from notifikasee:", data.message);
        return true;
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error?.message?.includes("Invalid apikey")) {
          console.log("API key already deleted or invalid in notifikasee");
          return true; // Consider as success since it's already gone
        }
        console.error("Failed to delete API key from notifikasee:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Error deleting API key from notifikasee:", error);
      return false;
    }
  };

  // Function to update device in Supabase (clear api_key and session)
  const updateDeviceInSupabase = async () => {
    if (!user?.id || !selectedAgent?.id) return false;

    try {
      const { error } = await supabase
        .from("device")
        .update({
          api_key: null,
          session: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("agent_id", selectedAgent.id);

      if (error) {
        console.error("Error updating device in Supabase:", error);
        return false;
      }

      console.log("Device updated in Supabase successfully");
      return true;
    } catch (error) {
      console.error("Error updating device in Supabase:", error);
      return false;
    }
  };

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);

    // Validasi user dan agent
    if (!user?.id) {
      setError("User tidak terautentikasi");
      setIsLoading(false);
      return;
    }

    if (!selectedAgent?.id) {
      setError("Silakan pilih agent terlebih dahulu");
      setIsLoading(false);
      return;
    }

    // Delete existing API key if session is offline or invalid
    if (
      deviceData &&
      deviceData.api_key &&
      (sessionStatus === "offline" || sessionStatus === "invalid")
    ) {
      console.log("Deleting existing API key before generating new one...");

      // Delete from notifikasee first
      const notifikaseeDeleted = await deleteApiKeyFromNotifikasee(
        deviceData.api_key
      );

      // Update device in Supabase (clear api_key and session)
      const supabaseUpdated = await updateDeviceInSupabase();

      if (!notifikaseeDeleted && !supabaseUpdated) {
        setError("Failed to clear existing credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      // Reset device data after deletion
      setDeviceData(null);
      setSessionStatus(null);
    }

    try {
      const credentials = btoa("wheza99@gmail.com:b4ZXVkenVp7xMPe");
      const response = await fetch("https://app.notif.my.id/ss/scanorpairing", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("QR Code generated successfully:", data);

        // Check if the response has an error tag
        if (data.tag === -2) {
          setError(
            data.message ||
              "Device quota exceeded. Please delete a device or upgrade subscription."
          );
          console.log("API returned error:", data.message);
        } else {
          // Cek apakah device sudah ada untuk user dan agent ini
          const { data: existingDevice } = await supabase
            .from("device")
            .select("id")
            .eq("user_id", user.id)
            .eq("agent_id", selectedAgent.id)
            .single();

          let deviceRecord, dbError;

          if (existingDevice) {
            // Update existing device
            const { data: updatedDevice, error } = await supabase
              .from("device")
              .update({
                api_key: data.apikey,
                session: data.session,
                is_active: true,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .eq("agent_id", selectedAgent.id)
              .select()
              .single();
            deviceRecord = updatedDevice;
            dbError = error;
          } else {
            // Insert new device
            const { data: newDevice, error } = await supabase
              .from("device")
              .insert({
                user_id: user.id,
                agent_id: selectedAgent.id,
                api_key: data.apikey,
                session: data.session,
                device_name: `WhatsApp Device - ${
                  selectedAgent.name || "Agent"
                }`,
                device_type: "whatsapp",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();
            deviceRecord = newDevice;
            dbError = error;
          }

          if (dbError) {
            console.error("Error saving device to database:", dbError);
            setError(`Gagal menyimpan data device: ${dbError.message}`);
          } else {
            console.log("Device saved to database:", deviceRecord);
            // Setelah berhasil simpan ke database, baru tampilkan QR code
            setQrData(data.qr);
            setSessionData(data);
            // Reload device data to update the status in both components
            setTimeout(() => {
              loadDeviceData();
              refreshDeviceData(); // Also refresh the connection status component
            }, 1000);
          }

          try {
            console.log("api key:", data.apikey);

            const credentials = btoa("wheza99@gmail.com:b4ZXVkenVp7xMPe");
            const response = await fetch(
              "https://app.notif.my.id/ss/updatewebhook",
              {
                method: "POST",
                headers: {
                  Authorization: `Basic ${credentials}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  apikey: data.apikey,
                  webhook: "https://api.autochat.agency/webhook/whatsapp",
                }),
              }
            );

            console.log("response:", response);

            if (response.ok) {
              const data = await response.json();
              console.log("Webhook updated successfully:", data);
            } else {
              const errorData = await response.json().catch(() => null);
              console.error("Failed to update webhook:", errorData);
            }
          } catch (error) {
            console.error("Error updating webhook:", error);
          }
        }
      } else {
        const errorText = await response.text();
        console.log(
          "Failed to generate QR code - Status:",
          response.status,
          "Response:",
          errorText
        );
        setError(
          `Failed to generate QR code: ${response.status} ${response.statusText}`
        );
        console.error("Failed to generate QR code:", errorText);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.log("Error generating QR code:", error);
      setError(`Error generating QR code: ${errorMessage}`);
      console.error("Error generating QR code:", error);
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
          {isLoading ? "Generating..." : "Generate QR Code"}
        </Button>

        {!isGenerateEnabled && sessionStatus === "online" && (
          <p className="text-xs text-center text-muted-foreground">
            QR code generation is disabled because the session is already
            online.
          </p>
        )}

        {(qrData || isLoading) && sessionStatus !== "online" && (
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
            ) : isLoading ? (
              <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    Generating QR Code...
                  </p>
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
