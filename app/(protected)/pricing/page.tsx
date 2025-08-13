// Pricing page to display subscription plans
"use client";

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
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { AgentProvider } from "@/contexts/agent-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import React, { useState } from "react";

// Pricing plans data
const pricingPlans = [
  {
    name: "Starter",
    monthlyPrice: "$10",
    yearlyPrice: "$100",
    description: "Perfect for small businesses just getting started",
    messageLimit: "1k",
    features: [
      "1 Agent Whatsapp",
      "Email support",
      "Basic message templates",
      "Basic analytics"
    ],
    popular: false,
    buttonText: "Start Free",
    buttonVariant: "outline" as const
  },
  {
    name: "Professional",
    monthlyPrice: "$50",
    yearlyPrice: "$500",
    description: "Ideal for growing businesses",
    messageLimit: "5K",
    features: [
      "5 Agents Whatsapps",
      "Priority support",
      "Advanced message templates",
      "Complete analytics",
      "API integration",
      "Automatic backup"
    ],
    popular: true,
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const
  },
  {
    name: "Enterprise",
    monthlyPrice: "Contact Us",
    yearlyPrice: "Contact Us",
    description: "Complete solution for large enterprises",
    messageLimit: "Custom",
    features: [
      "Unlimited Agents Whatsapp",
      "24/7 support",
      "Custom templates",
      "Enterprise analytics",
      "Full integration",
      "Dedicated account manager",
      "99.9% SLA"
    ],
    popular: false,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const
  }
];

// Main Pricing Content
function PricingContent() {
  const [isYearly, setIsYearly] = useState(false);
  const [messageVolume, setMessageVolume] = useState([5000]); // Default to 5k messages

  const formatMessageCount = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
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
              <Label htmlFor="billing-toggle" className={`text-sm font-medium ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="billing-toggle" className={`text-sm font-medium ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
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
                  <div className="text-sm text-muted-foreground text-center">messages/month</div>
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
                  className={`relative flex flex-col h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {plan.popular && (
                    <Badge 
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground"
                    >
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {typeof (isYearly ? plan.yearlyPrice : plan.monthlyPrice) === 'string' 
                          ? (isYearly ? plan.yearlyPrice : plan.monthlyPrice)
                          : `$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}`
                        }
                      </span>
                      {typeof (isYearly ? plan.yearlyPrice : plan.monthlyPrice) !== 'string' && (
                        <span className="text-muted-foreground">
                          {isYearly ? '/year' : '/month'}
                        </span>
                      )}
                    </div>
                    
                    {/* Message Limit Display */}
                    <div className="mt-4 p-3 border rounded-lg bg-muted/50">
                      <div className="text-lg font-semibold text-primary">{plan.messageLimit} messages/month</div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full mt-auto" 
                      variant={plan.buttonVariant}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function PricingPage() {
  return (
    <AgentProvider>
      <PricingContent />
    </AgentProvider>
  );
}