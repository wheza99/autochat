// Halaman dashboard utama dengan tabs dan sidebar
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAgent } from "@/contexts/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { BasicInformationContent } from "./components/basic-information-content";
import { SystemPromptSection } from "./components/system-prompt-section";
import { DocumentSection } from "./components/document-section";
import { WhatsAppSection } from "./components/whatsapp-section";
import { TransactionSection } from "./components/transaction-section";

// Types for WhatsApp session data
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

// Inner component that uses the agent context
function DashboardContent() {
  const { selectedAgent, agents, setSelectedAgent } = useAgent();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // WhatsApp state
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Handle agent_id parameter from URL
  useEffect(() => {
    const agentId = searchParams.get("agent_id");
    if (agentId && agents.length > 0) {
      const agent = agents.find((a) => a.id === agentId);
      if (agent && agent.id !== selectedAgent?.id) {
        setSelectedAgent(agent);
      }
    }
  }, [searchParams, agents, selectedAgent, setSelectedAgent]);

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

  // Check session status
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

  // Generate QR Code
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, agentId: selectedAgent.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setQrData(data.qr);
        setSessionData(data);
        setError(null);
        setTimeout(() => loadDeviceStatus(), 1000);
      } else {
        setError(data.error || "Failed to generate QR code");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect device
  const disconnectDevice = async () => {
    if (!user?.id || !deviceStatus?.id) {
      setError("User or device not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/device/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          device_id: deviceStatus.id,
          is_active: false,
          updated_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setQrData(null);
        setSessionData(null);
        setError(null);
        setTimeout(() => loadDeviceStatus(), 1000);
      } else {
        setError(data.error || "Failed to disconnect device");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
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

  // Determine connection status and phone number for WhatsApp
  const isConnected = Boolean(
    deviceStatus?.status_session === "online" ||
      (deviceStatus?.api_key && deviceStatus?.phone_number) ||
      selectedAgent?.phone
  );

  const phoneNumber =
    deviceStatus?.phone_number ||
    (selectedAgent?.phone
      ? selectedAgent.phone.replace("@s.whatsapp.net", "")
      : null);

  return (
    <>
      {/* Main Content Area with Tabs */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="space-y-2 pb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Agent {selectedAgent?.name ?? "Unknown"}
          </h1>
          <p className="text-lg text-muted-foreground">
            View and manage details agent
          </p>
        </div>

        {!selectedAgent ? (
          <div className="flex items-center justify-center h-full text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
              Select an Agent
            </h2>
            <p className="text-muted-foreground">
              Choose an agent from the sidebar to manage its settings.
            </p>
          </div>
        ) : (
          <div className="lg:flex gap-4">
            <div className="flex-1 lg:hidden space-y-4">
              <BasicInformationContent />
              <WhatsAppSection
                isConnected={isConnected}
                isLoading={isLoading}
                qrData={qrData}
                sessionData={sessionData}
                error={error}
                phoneNumber={phoneNumber}
                onConnect={generateQRCode}
                onDisconnect={disconnectDevice}
              />
              <TransactionSection />
            </div>
            <div className="flex-2 space-y-4">
              <SystemPromptSection />
              <DocumentSection />
            </div>
            <div className="flex-1 lg:block space-y-4">
              <BasicInformationContent />
              <WhatsAppSection
                isConnected={isConnected}
                isLoading={isLoading}
                qrData={qrData}
                sessionData={sessionData}
                error={error}
                phoneNumber={phoneNumber}
                onConnect={generateQRCode}
                onDisconnect={disconnectDevice}
              />
              <TransactionSection />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DashboardContent;
