// Checkout page with PayPal integration
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, ShoppingCart } from "lucide-react";
import { AppSidebar } from "@/components/shadcn-blocks/sidebar-08/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AgentProvider } from "@/contexts/agent-context";
import Script from "next/script";

// PayPal types
interface PayPalOrderData {
  orderID: string;
}

interface PayPalActions {
  order: {
    create: (orderData: {
      purchase_units: Array<{ amount: { value: string } }>;
    }) => Promise<string>;
    capture: () => Promise<PayPalCaptureResult>;
  };
}

interface PayPalCaptureResult {
  payer: {
    name: {
      given_name: string;
    };
  };
}

interface PayPalButtonInstance {
  close: () => void;
  isEligible: () => boolean;
  render: (container: HTMLElement) => Promise<void>;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalInstanceRef = useRef<PayPalButtonInstance | null>(null);

  // Get order details from URL parameters
  const planName = searchParams.get("plan") || "AutoChat Professional Plan";
  const planPrice = parseFloat(searchParams.get("price") || "400000");
  const taxAmount = parseFloat(searchParams.get("tax") || "44000");
  const totalAmount = parseFloat(searchParams.get("total") || "444000");
  const messageCount = searchParams.get("messages") || "5000";
  const billingType = searchParams.get("billing") || "monthly";

  // Cleanup function
  const cleanupPayPal = useCallback(() => {
    if (paypalInstanceRef.current) {
      try {
        paypalInstanceRef.current.close();
      } catch (error) {
        console.log("PayPal cleanup error:", error);
      }
      paypalInstanceRef.current = null;
    }

    if (paypalRef.current) {
      paypalRef.current.innerHTML = "";
    }

    setPaypalInitialized(false);
  }, []);

  const initializePayPal = useCallback(() => {
    if (!paypalRef.current || !window.paypal) return;

    try {
      const paypalButtons = window.paypal.Buttons({
        createOrder: function (data: PayPalOrderData, actions: PayPalActions) {
          // Get current total amount at the time of order creation
          const currentTotal = parseFloat(
            searchParams.get("total") || "444000"
          );
          // Convert IDR to USD for PayPal (approximate rate: 1 USD = 15000 IDR)
          const usdAmount = (currentTotal / 15000).toFixed(2);
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: usdAmount,
                },
              },
            ],
          });
        },
        onApprove: function (data: PayPalOrderData, actions: PayPalActions) {
          return actions.order
            .capture()
            .then(function (details: PayPalCaptureResult) {
              alert(
                "Transaction completed by " + details.payer.name.given_name
              );
              router.push("/dashboard?payment=success");
            });
        },
        onError: function (err: Error) {
          console.error("PayPal error:", err);
          alert("An error occurred during payment processing.");
        },
        onCancel: function () {
          console.log("Payment cancelled by user");
        },
      });

      if (paypalButtons.isEligible()) {
        paypalButtons
          .render(paypalRef.current)
          .then(() => {
            paypalInstanceRef.current = paypalButtons;
            setPaypalInitialized(true);
            console.log(
              "PayPal button rendered successfully with amount:",
              totalAmount
            );
          })
          .catch((error: Error) => {
            console.error("PayPal render error:", error);
            setPaypalInitialized(false);
          });
      } else {
        console.log("PayPal buttons not eligible");
        setPaypalInitialized(false);
      }
    } catch (error) {
      console.error("PayPal initialization error:", error);
      setPaypalInitialized(false);
    }
  }, [searchParams, totalAmount, router]);

  // Initialize PayPal when script loads
  useEffect(() => {
    if (
      paypalLoaded &&
      window.paypal &&
      !paypalInitialized &&
      paypalRef.current
    ) {
      initializePayPal();
    }
  }, [paypalLoaded, initializePayPal, paypalInitialized]);

  // No need to re-initialize PayPal when amount changes
  // The amount will be dynamically calculated in createOrder function

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPayPal();
    };
  }, [cleanupPayPal]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Checkout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-muted-foreground">
                Complete your purchase securely
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">{planName}</div>
                      <div className="text-sm text-muted-foreground">
                        {messageCount} messages/
                        {billingType === "yearly" ? "year" : "month"}
                      </div>
                    </div>
                    <span className="font-semibold">
                      Rp {planPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Tax (11%)</span>
                    <span>Rp {taxAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg font-bold">
                    <span>Total</span>
                    <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
                <CardDescription>Secure payment with PayPal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Your payment is secured by PayPal. You can pay with your
                    PayPal account or credit card.
                  </div>

                  {/* PayPal Button Container */}
                  <div
                    ref={paypalRef}
                    className="min-h-[50px] flex items-center justify-center"
                  >
                    {(!paypalLoaded || !paypalInitialized) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        {!paypalLoaded
                          ? "Loading PayPal..."
                          : "Initializing payment..."}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-4">
                    By completing this purchase, you agree to our Terms of
                    Service and Privacy Policy.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* PayPal Script */}
      <Script
        src="https://www.paypal.com/sdk/js?client-id=test&currency=USD"
        onLoad={() => {
          console.log("PayPal script loaded");
          setPaypalLoaded(true);
        }}
        onError={(e) => {
          console.error("PayPal script failed to load:", e);
        }}
        strategy="afterInteractive"
      />
    </SidebarProvider>
  );
}

export default function CheckoutPage() {
  return (
    <AgentProvider>
      <CheckoutContent />
    </AgentProvider>
  );
}

// Extend window object for PayPal
declare global {
  interface Window {
    paypal: {
      Buttons: (config: {
        createOrder: (
          data: PayPalOrderData,
          actions: PayPalActions
        ) => Promise<string>;
        onApprove: (
          data: PayPalOrderData,
          actions: PayPalActions
        ) => Promise<void>;
        onError: (err: Error) => void;
        onCancel: (data: PayPalOrderData) => void;
      }) => PayPalButtonInstance;
    };
  }
}
