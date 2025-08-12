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

interface UserDeviceLimit {
  id: string
  user_id: string
  max_devices: number
  plan_type: string
  created_at: string
  updated_at: string
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

  // Get stable device fingerprint
  const getDeviceFingerprint = useCallback(() => {
    // Use more stable identifiers that don't change frequently
    const stableInfo = {
      userAgent: navigator.userAgent.replace(/\s+/g, ' ').trim(),
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Remove canvas fingerprint as it can be inconsistent
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0
    }
    
    // Create a more stable hash
    const fingerprint = btoa(JSON.stringify(stableInfo))
      .replace(/[+/=]/g, '') // Remove special chars
      .slice(0, 32)
    
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

  // Register current device with cleanup
  const registerDevice = useCallback(async () => {
    if (!user) return
    
    try {
      const deviceId = getDeviceFingerprint()
      const deviceInfo = getDeviceInfo()
      const now = new Date().toISOString()
      
      // First, cleanup old inactive devices (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('device')
        .delete()
        .eq('user_id', user.id)
        .lt('last_active', thirtyDaysAgo)
        .eq('is_active', false)
      
      // Check if current device already exists
      const { data: existingDevice } = await supabase
        .from('device')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
        .single()
      
      if (existingDevice) {
        // Update existing device
        await supabase
          .from('device')
          .update({ 
            last_active: now,
            is_active: true,
            device_name: deviceInfo.deviceName, // Update name in case browser changed
            device_type: deviceInfo.deviceType,
            updated_at: now
          })
          .eq('id', existingDevice.id)
      } else {
        // Before registering new device, check device limit
        const { data: devices } = await supabase
          .from('device')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
        
        const { data: limits } = await supabase
          .from('user_device_limits')
          .select('max_devices')
          .eq('user_id', user.id)
          .single()
        
        const maxDevices = limits?.max_devices || 5
        const currentDeviceCount = devices?.length || 0
        
        if (currentDeviceCount >= maxDevices) {
          // Deactivate oldest device to make room
          const { data: oldestDevice } = await supabase
            .from('device')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('last_active', { ascending: true })
            .limit(1)
            .single()
          
          if (oldestDevice) {
            await supabase
              .from('device')
              .update({ is_active: false, updated_at: now })
              .eq('id', oldestDevice.id)
          }
        }
        
        // Register new device
        await supabase
          .from('device')
          .insert({
            user_id: user.id,
            device_id: deviceId,
            device_name: deviceInfo.deviceName,
            device_type: deviceInfo.deviceType,
            phone_number: null,
            last_active: now,
            is_active: true,
            created_at: now,
            updated_at: now,
            api_key: null
          })
      }
      
      // Refresh device list after registration
      await loadDevices()
    } catch (error) {
      console.error('Error registering device:', error)
    }
  }, [user, getDeviceFingerprint, getDeviceInfo])

  // Load devices with real-time filtering
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
    
    try {
      setLoading(true)
      setError(null)
      
      // Load only active devices for current user
      const { data: devicesData, error: devicesError } = await supabase
        .from('device')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true) // Only show active devices
        .order('last_active', { ascending: false })
      
      if (devicesError) throw devicesError
      
      // Load device limits
      let limitsData = null
      const { data: existingLimits, error: limitsError } = await supabase
        .from('user_device_limits')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (limitsError && limitsError.code === 'PGRST116') {
        // If no limits found, create default
        const { data: newLimits } = await supabase
          .from('user_device_limits')
          .insert({
            user_id: user.id,
            max_devices: 5,
            plan_type: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        limitsData = newLimits || { max_devices: 5, plan_type: 'free' }
      } else {
        limitsData = existingLimits
      }
      
      const devices = devicesData || []
      const limits = limitsData || { max_devices: 5, plan_type: 'free' }
      
      setDevices(devices)
      setDeviceStats({
        totalDevices: devices.length,
        activeDevices: devices.length, // All loaded devices are active
        maxDevices: limits.max_devices,
        planType: limits.plan_type
      })
      
    } catch (error) {
      console.error('Error loading devices:', error)
      setError('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Remove device
  const removeDevice = useCallback(async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('device')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user?.id)
      
      if (error) throw error
      
      await loadDevices()
    } catch (error) {
      console.error('Error removing device:', error)
      setError('Failed to remove device')
    }
  }, [user, loadDevices])

  // Update device status
  const updateDeviceStatus = useCallback(async (deviceId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('device')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .eq('user_id', user?.id)
      
      if (error) throw error
      
      await loadDevices()
    } catch (error) {
      console.error('Error updating device status:', error)
      setError('Failed to update device status')
    }
  }, [user, loadDevices])

  // Update device heartbeat
  const updateHeartbeat = useCallback(async () => {
    if (!user) return
    
    try {
      const deviceId = getDeviceFingerprint()
      await supabase
        .from('device')
        .update({ 
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
        .eq('is_active', true)
    } catch (error) {
      console.error('Error updating heartbeat:', error)
    }
  }, [user, getDeviceFingerprint])

  // Initialize and setup real-time subscription
  useEffect(() => {
    if (user) {
      registerDevice()
      loadDevices()
      
      // Setup real-time subscription for device changes
      const deviceSubscription = supabase
        .channel(`device_changes_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'device',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Device change detected:', payload)
            // Reload devices when changes occur
            loadDevices()
          }
        )
        .subscribe()
      
      // Setup heartbeat interval (every 5 minutes)
      const heartbeatInterval = setInterval(updateHeartbeat, 5 * 60 * 1000)
      
      // Setup periodic cleanup (every 10 minutes)
      const cleanupInterval = setInterval(async () => {
        try {
          // Mark devices as inactive if not seen for 15 minutes
          const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
          await supabase
            .from('device')
            .update({ 
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .lt('last_active', fifteenMinutesAgo)
            .eq('is_active', true)
          
          // Delete very old inactive devices (older than 7 days)
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          await supabase
            .from('device')
            .delete()
            .eq('user_id', user.id)
            .lt('last_active', sevenDaysAgo)
            .eq('is_active', false)
          
          // Refresh device list after cleanup
          loadDevices()
        } catch (error) {
          console.error('Error in periodic cleanup:', error)
        }
      }, 10 * 60 * 1000)
      
      // Handle page unload to mark device as inactive
      const handleBeforeUnload = async () => {
        try {
          const deviceId = getDeviceFingerprint()
          // Use sendBeacon for reliable delivery during page unload
          const data = JSON.stringify({
            user_id: user.id,
            device_id: deviceId,
            is_active: false,
            updated_at: new Date().toISOString()
          })
          
          // Fallback to synchronous request if sendBeacon not available
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/device/deactivate', data)
          } else {
            await supabase
              .from('device')
              .update({ 
                is_active: false,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .eq('device_id', deviceId)
          }
        } catch (error) {
          console.error('Error deactivating device on unload:', error)
        }
      }
      
      // Add event listeners for page unload
      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('pagehide', handleBeforeUnload)
      
      // Handle visibility change (tab switching)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // Tab became visible, update heartbeat
          updateHeartbeat()
        }
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // Cleanup on unmount
      return () => {
        deviceSubscription.unsubscribe()
        clearInterval(heartbeatInterval)
        clearInterval(cleanupInterval)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('pagehide', handleBeforeUnload)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [user, registerDevice, loadDevices, updateHeartbeat])

  return {
    devices,
    deviceStats,
    loading,
    error,
    loadDevices,
    removeDevice,
    updateDeviceStatus,
    registerDevice
  }
}