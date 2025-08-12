// Hook untuk mengelola device management
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface Device {
  id: string
  user_id: string
  device_name: string | null
  device_type: string | null
  device_id: string | null
  phone_number: string | null
  last_active: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  api_key: string | null
}

interface DeviceStats {
  totalDevices: number
  activeDevices: number
  maxDevices: number
  planType: string
}

export function useDevice() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    totalDevices: 0,
    activeDevices: 0,
    maxDevices: 5,
    planType: 'free'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get stable device fingerprint with localStorage persistence
  const getDeviceFingerprint = useCallback(() => {
    // Check if we already have a stored device ID for this browser
    const storedDeviceId = localStorage.getItem('device_fingerprint')
    
    if (storedDeviceId) {
      return storedDeviceId
    }
    
    // Generate new fingerprint only if not stored
    // Use a fixed timestamp for browser installation time to ensure consistency
    const browserInstallTime = localStorage.getItem('browser_install_time') || Date.now().toString()
    localStorage.setItem('browser_install_time', browserInstallTime)
    
    const stableInfo = {
      userAgent: navigator.userAgent.replace(/\s+/g, ' ').trim(),
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      // Use stored timestamp to ensure consistency
      browserInstallTime: browserInstallTime
    }
    
    // Create a stable hash
    const fingerprint = btoa(JSON.stringify(stableInfo))
      .replace(/[+/=]/g, '') // Remove special chars
      .slice(0, 32)
    
    // Store in localStorage for persistence across sessions
    localStorage.setItem('device_fingerprint', fingerprint)
    
    return fingerprint
  }, [])

  // Get device info
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent
    let deviceType = 'desktop'
    let deviceName = 'Unknown Device'
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile'
    }
    
    if (/Chrome/.test(userAgent)) {
      deviceName = 'Chrome Browser'
    } else if (/Firefox/.test(userAgent)) {
      deviceName = 'Firefox Browser'
    } else if (/Safari/.test(userAgent)) {
      deviceName = 'Safari Browser'
    } else if (/Edge/.test(userAgent)) {
      deviceName = 'Edge Browser'
    }
    
    return {
      deviceType,
      deviceName: `${deviceName} (${deviceType})`,
      browserInfo: userAgent
    }
  }, [])

  // Register current device with cleanup (DISABLED - Display only)
  const registerDevice = useCallback(async () => {
    if (!user) return
    
    console.log('🔍 Device registration disabled - display only mode')
    // Device registration is disabled for now
    return
  }, [user])

  // Load devices with real-time filtering (DISABLED - Display only)
  const loadDevices = useCallback(async () => {
    if (!user) {
      setDevices([])
      setDeviceStats({
        totalDevices: 0,
        activeDevices: 0,
        maxDevices: 5,
        planType: 'free'
      })
      setLoading(false)
      return
    }
    
    console.log('🔍 Device loading disabled - using dummy data for display')
    
    // Set dummy data for display only
    const dummyDevices = [
      {
        id: 'dummy-1',
        user_id: user.id,
        device_name: 'Chrome Browser (desktop)',
        device_type: 'desktop',
        device_id: 'dummy-device-id-1',
        phone_number: null,
        last_active: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        api_key: null
      }
    ]
    
    setDevices(dummyDevices)
    setDeviceStats({
      totalDevices: 1,
      activeDevices: 1,
      maxDevices: 5,
      planType: 'free'
    })
    setLoading(false)
  }, [user])

  // Remove device (DISABLED - Display only)
  const removeDevice = useCallback(async (deviceId: string) => {
    console.log('🔍 Device removal disabled - display only mode')
    alert('Device removal is currently disabled for display purposes')
  }, [])  

  // Update device status (DISABLED - Display only)
  const updateDeviceStatus = useCallback(async (deviceId: string, isActive: boolean) => {
    console.log('🔍 Device status update disabled - display only mode')
    alert('Device status update is currently disabled for display purposes')
  }, [])

  // Update device heartbeat (DISABLED - Display only)
  const updateHeartbeat = useCallback(async () => {
    console.log('🔍 Device heartbeat disabled - display only mode')
    // Heartbeat is disabled for now
    return
  }, [])

  // Initialize and setup real-time subscription (DISABLED - Display only)
  useEffect(() => {
    if (user) {
      console.log('🔍 Device management disabled - loading dummy data only')
      loadDevices()
    }
  }, [user, loadDevices])

  // Clear device fingerprint (useful for logout or device reset)
  const clearDeviceFingerprint = useCallback(() => {
    localStorage.removeItem('device_fingerprint')
    localStorage.removeItem('browser_install_time')
  }, [])

  return {
    devices,
    deviceStats,
    loading,
    error,
    loadDevices,
    removeDevice,
    updateDeviceStatus,
    registerDevice,
    clearDeviceFingerprint
  }
}