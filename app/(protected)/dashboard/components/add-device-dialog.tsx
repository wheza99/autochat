// Dialog untuk menampilkan QR code WhatsApp dan mengelola koneksi device
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XCircle, QrCode } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface SessionData {
  qr: string;
  session: string;
  apikey: string;
  device?: any;
}

interface AddDeviceDialogProps {
  isConnected: boolean;
  isLoading: boolean;
  qrData: string | null;
  sessionData: SessionData | null;
  onConnect: () => void;
  onDisconnect: () => void;
  disabled?: boolean;
  connectionStatus?: string | null;
}

export function AddDeviceDialog({
  isConnected,
  isLoading,
  qrData,
  sessionData,
  onConnect,
  onDisconnect,
  disabled = false,
  connectionStatus = null,
}: AddDeviceDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isLoading || disabled}
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
            Scan this QR code with your WhatsApp mobile app to connect your bot.
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
                  {connectionStatus && (
                    <p className="text-sm font-medium">
                      Status:{" "}
                      <span
                        className={`capitalize ${
                          connectionStatus === "online"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {connectionStatus}
                      </span>
                    </p>
                  )}
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
  );
}
