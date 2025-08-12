// Komponen untuk menampilkan penggunaan device dengan integrasi database Supabase
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useDevice } from "@/hooks/use-device"

interface DeviceUsageCardProps {
  onManageClick: () => void
}

export function DeviceUsageCard({ onManageClick }: DeviceUsageCardProps) {
  const { deviceStats, loading: deviceLoading } = useDevice()
  
  // Get current device fingerprint for display
  const getCurrentDeviceId = () => {
    const storedDeviceId = localStorage.getItem('device_fingerprint')
    return storedDeviceId ? `${storedDeviceId.slice(0, 8)}...${storedDeviceId.slice(-4)}` : 'Not Set'
  }

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 border mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {deviceLoading ? (
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-20 rounded"></div>
          ) : (
            `${deviceStats.totalDevices} / ${deviceStats.maxDevices} Device left`
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onManageClick}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Current Device: <span className="font-mono">{getCurrentDeviceId()}</span>
      </div>
      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mb-3">
        <div 
          className="bg-gray-600 dark:bg-gray-400 rounded-full h-2 transition-all duration-300"
          style={{ 
            width: deviceLoading ? '0%' : `${Math.min((deviceStats.totalDevices / deviceStats.maxDevices) * 100, 100)}%` 
          }}
        ></div>
      </div>
      <button 
        className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg py-2 px-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
        onClick={onManageClick}
      >
        <span className="text-yellow-500">💎</span>
        {deviceStats.totalDevices >= deviceStats.maxDevices ? 'Upgrade' : 'Manage Devices'}
      </button>
    </div>
  )
}