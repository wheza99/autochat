'use client';

import { useState, useEffect, useCallback } from 'react';

interface WhatsAppStatus {
  isReady: boolean;
  qrCode: string | null;
  clientInfo: {
    number?: string;
    name?: string;
    platform?: string;
  } | null;
}

interface UseWhatsAppReturn {
  status: WhatsAppStatus;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useWhatsApp(): UseWhatsAppReturn {
  const [status, setStatus] = useState<WhatsAppStatus>({
    isReady: false,
    qrCode: null,
    clientInfo: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current status
  const refreshStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/whatsapp');
      
      if (!response.ok) {
        throw new Error('Failed to fetch WhatsApp status');
      }
      
      const data = await response.json();
      setStatus({
        isReady: data.isReady,
        qrCode: data.qrCode,
        clientInfo: data.clientInfo
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching WhatsApp status:', err);
    }
  }, []);

  // Connect to WhatsApp
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'connect' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to WhatsApp');
      }
      
      // Start polling for status updates
      const pollStatus = async () => {
        await refreshStatus();
        
        // Continue polling if not ready and no error
        if (!status.isReady && !error) {
          setTimeout(pollStatus, 2000);
        }
      };
      
      setTimeout(pollStatus, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error connecting to WhatsApp:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status.isReady, error, refreshStatus]);

  // Disconnect from WhatsApp
  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/whatsapp', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect from WhatsApp');
      }
      
      setStatus({
        isReady: false,
        qrCode: null,
        clientInfo: null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error disconnecting from WhatsApp:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh status on mount and periodically
  useEffect(() => {
    refreshStatus();
    
    // Set up periodic status checking
    const interval = setInterval(refreshStatus, 5000);
    
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return {
    status,
    isLoading,
    error,
    connect,
    disconnect,
    refreshStatus
  };
}