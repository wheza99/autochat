import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const email = process.env.WHATSAPP_API_EMAIL;
    const password = process.env.WHATSAPP_API_PASSWORD;
    const apiUrl = process.env.WHATSAPP_API_URL;

    if (!email || !password || !apiUrl) {
      return NextResponse.json(
        { error: "WhatsApp API configuration is missing" },
        { status: 500 }
      );
    }

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
      return NextResponse.json(data);
    } else {
      console.error("Failed to generate QR code");
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
