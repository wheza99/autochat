// Komponen untuk mengelola device management dengan tabel
"use client"

import * as React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MoreVertical, 
  Trash2, 
  Power, 
  PowerOff,
  RefreshCw
} from "lucide-react"
import { useDevice } from "@/hooks/use-device"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

interface DeviceManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeviceManagement({ open, onOpenChange }: DeviceManagementProps) {
  const { devices, deviceStats, loading, removeDevice, updateDeviceStatus, loadDevices } = useDevice()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const handleRemoveDevice = async (deviceId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus device ini?')) {
      setActionLoading(deviceId)
      try {
        await removeDevice(deviceId)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const handleToggleDevice = async (deviceId: string, currentStatus: boolean) => {
    setActionLoading(deviceId)
    try {
      await updateDeviceStatus(deviceId, !currentStatus)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefresh = async () => {
    setActionLoading('refresh')
    try {
      await loadDevices()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Device Management</DialogTitle>
              <DialogDescription>
                Kelola device yang terhubung ke akun Anda. 
                Anda menggunakan {deviceStats.totalDevices} dari {deviceStats.maxDevices} device yang tersedia.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={actionLoading === 'refresh'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </DialogHeader>
        
        {/* Device Stats */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{deviceStats.totalDevices}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Devices</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{deviceStats.activeDevices}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Devices</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{deviceStats.maxDevices}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Max Devices</div>
          </div>
        </div>

        {/* Device Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada device yang terdaftar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device.device_type)}
                        <span className="font-medium">{device.device_name || 'Unknown Device'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {device.device_type || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={device.is_active ? "default" : "secondary"}
                        className={device.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                      >
                        {device.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {device.last_active ? (
                        formatDistanceToNow(new Date(device.last_active), { 
                          addSuffix: true,
                          locale: id 
                        })
                      ) : (
                        'Never'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                      {device.phone_number || 'Not Set'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                      {device.api_key ? (
                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          {device.api_key.slice(0, 8)}...{device.api_key.slice(-4)}
                        </span>
                      ) : (
                        'Not Set'
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            disabled={actionLoading === device.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleDevice(device.id, device.is_active || false)}
                            disabled={actionLoading === device.id}
                          >
                            {device.is_active ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveDevice(device.id)}
                            disabled={actionLoading === device.id}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Plan Upgrade Notice */}
        {deviceStats.totalDevices >= deviceStats.maxDevices && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Device Limit Reached:</strong> Anda telah mencapai batas maksimal device ({deviceStats.maxDevices}). 
              Upgrade ke plan Pro untuk menambah lebih banyak device.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}