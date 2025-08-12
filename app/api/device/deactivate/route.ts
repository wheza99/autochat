// API endpoint untuk deactivate device saat page unload
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, device_id, is_active, updated_at } = body

    if (!user_id || !device_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update device status
    const { error } = await supabase
      .from('device')
      .update({ 
        is_active: is_active || false,
        updated_at: updated_at || new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('device_id', device_id)

    if (error) {
      console.error('Error deactivating device:', error)
      return NextResponse.json(
        { error: 'Failed to deactivate device' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in device deactivate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}