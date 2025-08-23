import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Function to delete API key from notifikasee
const deleteApiKeyFromNotifikasee = async (apiKey: string) => {
  try {
    const email = process.env.WHATSAPP_API_EMAIL;
    const password = process.env.WHATSAPP_API_PASSWORD;
    
    if (!email || !password) {
      console.error('WhatsApp API credentials not configured');
      return false;
    }
    
    const credentials = btoa(`${email}:${password}`);
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

// Function to update webhook
const updateWebhook = async (apiKey: string) => {
  try {
    const email = process.env.WHATSAPP_API_EMAIL;
    const password = process.env.WHATSAPP_API_PASSWORD;
    
    if (!email || !password) {
      console.error('WhatsApp API credentials not configured');
      return false;
    }
    
    const credentials = btoa(`${email}:${password}`);
    const response = await fetch("https://app.notif.my.id/ss/updatewebhook", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: apiKey,
        webhook: "https://api.autochat.agency/webhook/whatsapp",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Webhook updated successfully:", data);
      return true;
    } else {
      const errorData = await response.json().catch(() => null);
      console.error("Failed to update webhook:", errorData);
      return false;
    }
  } catch (error) {
    console.error("Error updating webhook:", error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, agentId } = body;

    // Validate required parameters
    if (!userId || !agentId) {
      return NextResponse.json(
        { error: "User ID and Agent ID are required" },
        { status: 400 }
      );
    }

    const email = process.env.WHATSAPP_API_EMAIL;
    const password = process.env.WHATSAPP_API_PASSWORD;
    const apiUrl = process.env.WHATSAPP_API_URL;

    if (!email || !password || !apiUrl) {
      return NextResponse.json(
        { error: "WhatsApp API configuration is missing" },
        { status: 500 }
      );
    }

    // Check for existing device
    const { data: existingDevice } = await supabase
      .from("device")
      .select("*")
      .eq("user_id", userId)
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // If device exists and has API key, check session status
    if (existingDevice?.api_key) {
      try {
        const credentials = btoa(`${email}:${password}`);
        const statusResponse = await fetch("https://app.notif.my.id/ss/info", {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apikey: existingDevice.api_key,
          }),
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.status_session === "online") {
            return NextResponse.json(
              { error: "Device is already connected and online" },
              { status: 400 }
            );
          }
        }

        // If session is offline or invalid, delete existing API key
        console.log("Deleting existing API key before generating new one...");
        await deleteApiKeyFromNotifikasee(existingDevice.api_key);

        // Clear api_key and session from Supabase
        await supabase
          .from("device")
          .update({
            api_key: null,
            session: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("agent_id", agentId);
      } catch (error) {
        console.error("Error checking existing session:", error);
      }
    }

    // Generate new QR code
    const credentials = btoa(`${email}:${password}`);
    const response = await fetch(`${apiUrl}/ss/scanorpairing`, {
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
        return NextResponse.json(
          {
            error:
              data.message ||
              "Device quota exceeded. Please delete a device or upgrade subscription.",
          },
          { status: 400 }
        );
      }

      // Save or update device in Supabase
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
          .eq("user_id", userId)
          .eq("agent_id", agentId)
          .select()
          .single();
        deviceRecord = updatedDevice;
        dbError = error;
      } else {
        // Insert new device
        const { data: newDevice, error } = await supabase
          .from("device")
          .insert({
            user_id: userId,
            agent_id: agentId,
            api_key: data.apikey,
            session: data.session,
            device_name: `WhatsApp Device - Agent`,
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
        return NextResponse.json(
          { error: `Failed to save device: ${dbError.message}` },
          { status: 500 }
        );
      }

      console.log("Device saved to database:", deviceRecord);

      // Update webhook
      await updateWebhook(data.apikey);

      return NextResponse.json({
        qr: data.qr,
        session: data.session,
        apikey: data.apikey,
        device: deviceRecord,
      });
    } else {
      const errorText = await response.text();
      console.error("Failed to generate QR code:", errorText);
      return NextResponse.json(
        { error: "Failed to generate QR code" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
