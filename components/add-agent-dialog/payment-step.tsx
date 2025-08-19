"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentStepProps {
  isProcessing: boolean;
  paymentData?: {
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    amount: number;
    pay_code: string;
    checkout_url: string;
    status: string;
    expired_time: number;
    instructions: {
      title: string;
      steps: string[];
    }[];
  } | null;
  error?: string | null;
}

export function PaymentStep({
  isProcessing,
  paymentData,
  error,
}: PaymentStepProps) {
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Pembayaran Gagal
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Memproses Pembayaran</h3>
          <p className="text-sm text-muted-foreground">
            Silakan selesaikan pembayaran anda
          </p>
        </div>
      </div>
    );
  }

  if (paymentData) {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    };

    const formatExpiredTime = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleString("id-ID");
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">
            Pembayaran Berhasil Dibuat
          </h3>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Metode Pembayaran
                  </label>
                  <p className="text-base font-semibold">
                    {paymentData.payment_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <p className="text-base font-semibold text-orange-600">
                    {paymentData.status}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Kode Pembayaran
                </label>
                <p className="text-lg font-mono font-bold text-blue-600">
                  {paymentData.pay_code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Jumlah
                  </label>
                  <p className="text-base font-semibold">
                    {formatCurrency(paymentData.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Berlaku Hingga
                  </label>
                  <p className="text-base">
                    {formatExpiredTime(paymentData.expired_time)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Referensi
                </label>
                <p className="text-base font-mono">{paymentData.reference}</p>
              </div>
            </div>

            {paymentData.instructions &&
              paymentData.instructions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-3">
                    Cara Pembayaran:
                  </h4>
                  {paymentData.instructions.map((instruction, index) => (
                    <div key={index} className="mb-4">
                      <h5 className="text-sm font-medium mb-2">
                        {instruction.title}
                      </h5>
                      <ol className="text-sm space-y-1 pl-4">
                        {instruction.steps.map((step, stepIndex) => (
                          <li
                            key={stepIndex}
                            className="list-decimal"
                            dangerouslySetInnerHTML={{ __html: step }}
                          />
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Penting:</strong> Simpan kode pembayaran dan selesaikan
                pembayaran sebelum waktu kedaluwarsa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
