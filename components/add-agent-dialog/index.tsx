"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useAgent } from "@/contexts/agent-context";

import { DialogHeaderStep } from "./dialog-header-step";
import { AgentFormStep } from "./agent-form-step";
import { PricingStep } from "./pricing-step";
import { PaymentStep } from "./payment-step";
import { DialogFooterStep } from "./dialog-footer-step";
import { AgentForm, AddAgentDialogProps, PricingPlan } from "./types";

// Pricing plans data
const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    monthlyPrice: 480000,
    yearlyPrice: 4800000,
    description: "Perfect for small businesses just getting started",
    messageLimit: "5k",
    baseMessages: 5000,
    features: [
      "1 Agent Whatsapp",
      "5000 Messages Limit per Month",
      "Email support",
    ],
    popular: false,
    buttonText: "Select Plan",
    buttonVariant: "outline" as const,
  },
  {
    name: "Professional",
    monthlyPrice: 2000000,
    yearlyPrice: 20000000,
    description: "Ideal for growing businesses who hava many customers",
    messageLimit: "50K",
    baseMessages: 50000,
    features: [
      "1 Agent Whatsapp",
      "5000 Messages Limit per Month",
      "Priority support",
    ],
    popular: true,
    buttonText: "Select Plan",
    buttonVariant: "default" as const,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Contact Us",
    yearlyPrice: "Contact Us",
    description: "Complete solution for large enterprises",
    messageLimit: "Custom",
    baseMessages: 0,
    features: [
      "1 Agent Whatsapp",
      "Unlimited Messages using Your Own API Key",
      "Dedicated account manager",
    ],
    popular: false,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
];

export function AddAgentDialog({ open, onOpenChange }: AddAgentDialogProps) {
  const { user } = useAuth();
  const { loadAgents } = useAgent();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isCreating, setIsCreating] = React.useState(false);
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isYearly, setIsYearly] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [paymentData, setPaymentData] = React.useState<{
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
  } | null>(null);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [newAgentForm, setNewAgentForm] = React.useState<AgentForm>({
    name: "",
    phone: "",
    model: "",
    system_prompt: "",
    api_key: "",
  });

  const formatMessageCount = (value: number) => {
    return value.toLocaleString();
  };

  // Calculate dynamic pricing based on message volume
  const calculatePrice = (basePrice: number | string) => {
    if (typeof basePrice === "string") {
      return basePrice;
    }

    // Calculate price based on selected message count
    const calculatedPrice = Math.round(basePrice);

    return `Rp ${calculatedPrice.toLocaleString("id-ID")}`;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!newAgentForm.name.trim()) {
        alert("Agent name is required");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedPlan) {
        alert("Please select a pricing plan");
        return;
      }
      await handlePayment();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setPaymentData(null);
      setPaymentError(null);
    }
  };

  const handlePayment = async () => {
    setCurrentStep(3);
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const merchantRef = `INV${Date.now()}`;
      const selectedPlanData = pricingPlans.find(
        (plan) => plan.name === selectedPlan
      );
      const amount =
        typeof selectedPlanData?.monthlyPrice === "number"
          ? selectedPlanData.monthlyPrice
          : 1000000;

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: newAgentForm.name.trim(),
          customer_email: "customer@example.com", // Default email, bisa diambil dari form
          customer_phone: newAgentForm.phone || "081234567890", // Menggunakan phone dari form atau default
          amount: amount,
          merchant_ref: merchantRef,
          order_items: [
            {
              sku: `PLAN_${selectedPlan?.toUpperCase()}`,
              name: `${selectedPlan} Plan - AutoChat Agent`,
              price: amount / 2,
              quantity: 1,
              product_url: "https://autochat.com/plans",
              image_url: "https://autochat.com/images/plan.jpg",
            },
            {
              sku: "SETUP_FEE",
              name: "Setup Fee",
              price: amount / 2,
              quantity: 1,
              product_url: "https://autochat.com/setup",
              image_url: "https://autochat.com/images/setup.jpg",
            },
          ],
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentData(result.data);
      } else {
        setPaymentError(result.message || "Payment creation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
  };

  const handleCreateAgent = async () => {
    if (!newAgentForm.name.trim()) {
      alert("Agent name is required");
      return;
    }

    if (!selectedPlan) {
      alert("Please select a pricing plan");
      return;
    }

    if (!paymentData) {
      alert("Payment must be completed first");
      return;
    }

    setIsCreating(true);

    try {
      // Format phone number with WhatsApp suffix if provided
      const formattedPhone = newAgentForm.phone.trim()
        ? `${newAgentForm.phone.trim()}@s.whatsapp.net`
        : null;

      const { error } = await supabase
        .from("agents")
        .insert({
          name: newAgentForm.name.trim(),
          phone: formattedPhone,
          model: newAgentForm.model || null,
          system_prompt: newAgentForm.system_prompt.trim() || null,
          api_key: newAgentForm.api_key.trim() || null,
          user_id: user?.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating agent:", error);
        alert("Failed to create agent. Please try again.");
        return;
      }

      // Refresh agents list
      await loadAgents();

      // Reset form and close dialog
      setNewAgentForm({
        name: "",
        phone: "",
        model: "",
        system_prompt: "",
        api_key: "",
      });
      setCurrentStep(1);
      setSelectedPlan(null);
      setShowApiKey(false);
      setPaymentData(null);
      setPaymentError(null);
      setIsProcessingPayment(false);
      onOpenChange(false);

      alert("Agent created successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setNewAgentForm({
      name: "",
      phone: "",
      model: "",
      system_prompt: "",
      api_key: "",
    });
    setCurrentStep(1);
    setSelectedPlan(null);
    setShowApiKey(false);
    setPaymentData(null);
    setPaymentError(null);
    setIsProcessingPayment(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeaderStep currentStep={currentStep} />

        {currentStep === 1 && (
          <AgentFormStep
            newAgentForm={newAgentForm}
            setNewAgentForm={setNewAgentForm}
            showApiKey={showApiKey}
            setShowApiKey={setShowApiKey}
          />
        )}

        {currentStep === 2 && (
          <PricingStep
            isYearly={isYearly}
            setIsYearly={setIsYearly}
            selectedPlan={selectedPlan}
            handlePlanSelect={handlePlanSelect}
            pricingPlans={pricingPlans}
            calculatePrice={calculatePrice}
            formatMessageCount={formatMessageCount}
          />
        )}

        {currentStep === 3 && (
          <PaymentStep
            isProcessing={isProcessingPayment}
            paymentData={paymentData}
            error={paymentError}
          />
        )}

        <DialogFooterStep
          currentStep={currentStep}
          isCreating={isCreating}
          handleCancel={handleCancel}
          handleBack={handleBack}
          handleNext={handleNext}
          handleCreateAgent={handleCreateAgent}
          newAgentForm={newAgentForm}
          selectedPlan={selectedPlan}
        />
      </DialogContent>
    </Dialog>
  );
}
