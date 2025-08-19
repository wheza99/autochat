import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface TripayPaymentRequest {
  customer_name: string;
  amount: number;
  merchant_ref: string;
}

interface TripayResponse {
  success: boolean;
  message: string;
  data?: {
    uuid: string;
    merchant_ref: string;
    customer_name: string;
    payment_name: string;
    payment_method: string;
    pay_code: string;
    qr_string: string | null;
    qr_url: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: TripayPaymentRequest = await request.json();
    const { customer_name, amount, merchant_ref } = body;

    // Validasi input
    if (!customer_name || !amount || !merchant_ref) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ambil konfigurasi dari environment variables
    const apiKey = process.env.TRIPAY_API_KEY;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
    const method = "QRIS"; // Default ke BCA Virtual Account

    if (!apiKey || !privateKey || !merchantCode) {
      return NextResponse.json(
        { success: false, message: "Payment gateway configuration missing" },
        { status: 500 }
      );
    }

    // Buat signature
    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(merchantCode + method + merchant_ref)
      .digest("hex");

    // Payload untuk Tripay
    const payload = {
      method: method,
      merchant_ref: merchant_ref,
      customer_name: customer_name,
      signature: signature,
    };

    // Panggil API Tripay
    const response = await fetch(
      "https://tripay.co.id/api/open-payment/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const tripayResponse: TripayResponse = await response.json();

    if (!tripayResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: tripayResponse.message || "Payment creation failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tripayResponse.data,
    });
  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
