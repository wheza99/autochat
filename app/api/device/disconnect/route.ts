// API endpoint untuk disconnect device
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, device_id, is_active, updated_at } = body;

    if (!user_id || !device_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.WHATSAPP_API_URL;

    // Get device data first to retrieve api_key
    const { data: deviceData, error: fetchError } = await supabase
      .from("device")
      .select("api_key, agent_id")
      .eq("user_id", user_id)
      .eq("id", device_id)
      .single();

    if (fetchError) {
      console.error("Error fetching device:", fetchError);
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Delete API key from notifikasee if exists
    if (deviceData.api_key) {
      try {
        const email = process.env.WHATSAPP_API_EMAIL;
        const password = process.env.WHATSAPP_API_PASSWORD;

        if (!email || !password) {
          console.error("WhatsApp API credentials not configured");
          // Continue with local cleanup even if credentials are missing
        } else {
          const credentials = btoa(`${email}:${password}`);
          await fetch(`${apiUrl}/ss/delete`, {
            method: "POST",
            headers: {
              Authorization: `Basic ${credentials}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ apikey: deviceData.api_key }),
          });
        }
      } catch (notifError) {
        console.error("Error deleting API key from notifikasee:", notifError);
        // Continue with local cleanup even if notifikasee deletion fails
      }
    }

    // Clear device data from Supabase
    const { error: updateError } = await supabase
      .from("device")
      .update({
        api_key: null,
        session: null,
        is_active: false,
        updated_at: updated_at || new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("id", device_id);

    if (updateError) {
      console.error("Error updating device:", updateError);
      return NextResponse.json(
        { error: "Failed to disconnect device" },
        { status: 500 }
      );
    }

    // Clear agent phone if agent_id exists
    if (deviceData.agent_id) {
      const { error: agentError } = await supabase
        .from("agents")
        .update({ phone: null })
        .eq("id", deviceData.agent_id);

      if (agentError) {
        console.error("Error clearing agent phone:", agentError);
        // Don't fail the request if agent update fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in device disconnect API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
