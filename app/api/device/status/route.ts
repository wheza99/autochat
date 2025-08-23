import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, agentId } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const email = process.env.WHATSAPP_API_EMAIL;
    const password = process.env.WHATSAPP_API_PASSWORD;
    const apiUrl = process.env.WHATSAPP_API_URL;

    if (!email || !password || !apiUrl) {
      return NextResponse.json(
        { error: "WhatsApp API credentials not configured" },
        { status: 500 }
      );
    }

    try {
      const credentials = btoa(`${email}:${password}`);
      const response = await fetch(`${apiUrl}/ss/info`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apikey: apiKey }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update agent phone if connected, different, and agentId provided
        if (data.status_session === "online" && data.phone_number && agentId) {
          // Get current agent data
          const { data: agent, error: agentError } = await supabase
            .from("agents")
            .select("phone")
            .eq("id", agentId)
            .single();

          if (!agentError && agent && agent.phone !== data.phone_number) {
            // Update agent phone in database
            await supabase
              .from("agents")
              .update({ phone: data.phone_number })
              .eq("id", agentId);
          }
        }

        return NextResponse.json({
          success: true,
          status_session: data.status_session,
          phone_number: data.phone_number,
        });
      } else {
        console.error("Failed to check session status:", response.statusText);
        return NextResponse.json(
          { error: "Failed to check session status" },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      console.error("Error checking session status:", fetchError);
      return NextResponse.json(
        { error: "Error checking session status" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in status check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
