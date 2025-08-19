import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface TripayPaymentRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  merchant_ref: string;
  order_items: {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    product_url?: string;
    image_url?: string;
  }[];
}

interface TripayResponse {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    merchant_ref: string;
    payment_selection_type: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    callback_url: string;
    return_url: string;
    amount: number;
    fee_merchant: number;
    fee_customer: number;
    total_fee: number;
    amount_received: number;
    pay_code: string;
    pay_url: string | null;
    checkout_url: string;
    status: string;
    expired_time: number;
    order_items: {
      sku: string;
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
      product_url?: string;
      image_url?: string;
    }[];
    instructions: {
      title: string;
      steps: string[];
    }[];
    qr_string: string | null;
    qr_url: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: TripayPaymentRequest = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      amount,
      merchant_ref,
      order_items,
    } = body;

    // Validasi input
    if (
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !amount ||
      !merchant_ref ||
      !order_items
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ambil konfigurasi dari environment variables
    const apiKey = process.env.TRIPAY_API_KEY;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const merchantCode = process.env.TRIPAY_MERCHANT_CODE;

    if (!apiKey || !privateKey || !merchantCode) {
      return NextResponse.json(
        { success: false, message: "Payment gateway configuration missing" },
        { status: 500 }
      );
    }

    // Hitung expired time (24 jam dari sekarang)
    const expiry = parseInt(
      String(Math.floor(new Date().getTime() / 1000) + 24 * 60 * 60)
    );

    // Buat signature
    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(merchantCode + merchant_ref + amount)
      .digest("hex");

    // Payload untuk Tripay
    const payload = {
      method: "BCAVA",
      merchant_ref: merchant_ref,
      amount: amount,
      customer_name: customer_name,
      customer_email: customer_email,
      customer_phone: customer_phone,
      order_items: order_items,
      return_url: "https://domainanda.com/redirect",
      expired_time: expiry,
      signature: signature,
    };

    // Panggil API Tripay
    const response = await fetch(
      "https://tripay.co.id/api/transaction/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data: TripayResponse = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Payment creation failed",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment created successfully",
      data: data.data,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat pembayaran",
      },
      { status: 500 }
    );
  }
}
