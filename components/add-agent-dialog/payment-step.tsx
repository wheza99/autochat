"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentStepProps {
  isProcessing: boolean;
  paymentData?: {
    payment_name: string;
    pay_code: string;
    customer_name: string;
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
                  Kode Pembayaran
                </label>
                <p className="text-lg font-mono font-bold text-blue-600">
                  {paymentData.pay_code}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nama Pelanggan
                </label>
                <p className="text-base">{paymentData.customer_name}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Petunjuk:</strong> Gunakan kode pembayaran di atas untuk
                menyelesaikan transaksi melalui {paymentData.payment_name}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
