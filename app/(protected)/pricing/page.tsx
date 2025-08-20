// Pricing page to display subscription plans
"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { AgentProvider, useAgent } from "@/contexts/agent-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Pricing plans data
const pricingPlans = [
  {
    name: "Starter",
    monthlyPrice: 100000,
    yearlyPrice: 1000000,
    description: "Perfect for small businesses just getting started",
    messageLimit: "1k",
    baseMessages: 1000,
    features: [
      "1 Agent Whatsapp",
      "Email support",
      "Basic message templates",
      "Basic analytics",
    ],
    popular: false,
    buttonText: "Upgrade Now",
    buttonVariant: "outline" as const,
  },
  {
    name: "Professional",
    monthlyPrice: 2000000,
    yearlyPrice: 20000000,
    description: "Ideal for growing businesses",
    messageLimit: "5K",
    baseMessages: 5000,
    features: [
      "5 Agents Whatsapps",
      "Priority support",
      "Advanced message templates",
      "Complete analytics",
      "API integration",
      "Automatic backup",
    ],
    popular: true,
    buttonText: "Upgrade Now",
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
      "Unlimited Agents Whatsapp",
      "24/7 support",
      "Custom templates",
      "Enterprise analytics",
      "Full integration",
      "Dedicated account manager",
      "99.9% SLA",
    ],
    popular: false,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
];

// Main Pricing Content
function PricingContent() {
  const { selectedAgent } = useAgent();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [messageVolume, setMessageVolume] = useState([1000]); // Default to 5k messages to show Professional plan base price

  const formatMessageCount = (value: number) => {
    return value.toLocaleString();
  };

  // Calculate dynamic pricing based on message volume
  const calculatePrice = (
    basePrice: number | string,
    messageCount: number,
    baseMessages: number
  ) => {
    if (typeof basePrice === "string") {
      return basePrice;
    }

    // Calculate price per message based on base plan
    const pricePerMessage = basePrice / baseMessages;

    // Calculate price based on selected message count
    const calculatedPrice = Math.round(pricePerMessage * messageCount);

    return `Rp ${calculatedPrice.toLocaleString("id-ID")}`;
  };

  // Handle checkout navigation
  const handleCheckout = (plan: (typeof pricingPlans)[0]) => {
    if (plan.buttonText === "Contact Sales") {
      // Handle contact sales differently
      return;
    }

    const basePrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const price = calculatePrice(
      basePrice,
      messageVolume[0],
      plan.baseMessages
    );
    const numericPrice =
      typeof price === "string" && price !== "Contact Us"
        ? parseFloat(price.replace("Rp ", "").replace(/\./g, ""))
        : 0;

    // Calculate tax (11%)
    const tax = Math.round(numericPrice * 0.11 * 100) / 100;
    const total = numericPrice + tax;

    // Navigate to checkout with query parameters
    const searchParams = new URLSearchParams({
      plan: plan.name,
      price: numericPrice.toString(),
      tax: tax.toString(),
      total: total.toString(),
      messages: messageVolume[0].toString(),
      billing: isYearly ? "yearly" : "monthly",
    });

    router.push(`/checkout?${searchParams.toString()}`);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {selectedAgent && (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/agent_info">
                      {selectedAgent.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>Pricing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Choose the Right Plan for Your Business
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enhance your customer service with intelligent AutoChat agents.
              Start free and upgrade as your business grows.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Label
              htmlFor="billing-toggle"
              className={`text-sm font-medium ${
                !isYearly ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label
              htmlFor="billing-toggle"
              className={`text-sm font-medium ${
                isYearly ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Yearly
            </Label>
          </div>

          {/* Message Volume Slider */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-4">
                How many messages per month do you need?
              </h3>
            </div>
            <div className="flex items-center gap-8 mb-4">
              <div className="flex-shrink-0">
                <div className="text-4xl font-bold text-primary">
                  {formatMessageCount(messageVolume[0])}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  messages/month
                </div>
              </div>
              <div className="flex-1">
                <Slider
                  value={messageVolume}
                  onValueChange={setMessageVolume}
                  max={10000}
                  min={1000}
                  step={1000}
                  className="w-full h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1k</span>
                  <span>2k</span>
                  <span>3k</span>
                  <span>4k</span>
                  <span>5k</span>
                  <span>6k</span>
                  <span>7k</span>
                  <span>8k</span>
                  <span>9k</span>
                  <span>10k</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative flex flex-col h-full ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {calculatePrice(
                        isYearly ? plan.yearlyPrice : plan.monthlyPrice,
                        messageVolume[0],
                        plan.baseMessages
                      )}
                    </span>
                    {typeof (isYearly
                      ? plan.yearlyPrice
                      : plan.monthlyPrice) !== "string" && (
                      <span className="text-muted-foreground">
                        {isYearly ? "/year" : "/month"}
                      </span>
                    )}
                  </div>

                  {/* Message Limit Display */}
                  <div className="mt-4 p-3 border rounded-lg bg-muted/50">
                    <div className="text-lg font-semibold text-primary">
                      {plan.messageLimit === "Custom" ||
                      plan.messageLimit === "Unlimited"
                        ? plan.messageLimit
                        : `${formatMessageCount(messageVolume[0])}`}{" "}
                      messages/month
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-auto"
                    variant={plan.buttonVariant}
                    size="lg"
                    onClick={() => handleCheckout(plan)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function PricingPage() {
  return (
    <AgentProvider>
      <PricingContent />
    </AgentProvider>
  );
}
