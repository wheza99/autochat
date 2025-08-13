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
import React from "react";

// Pricing plans data
const pricingPlans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for small businesses just getting started",
    features: [
      "1 AutoChat Agent",
      "1,000 messages per month",
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
    price: "$29",
    period: "/month",
    description: "Ideal for growing businesses",
    features: [
      "5 AutoChat Agents",
      "10,000 messages per month",
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
    price: "$99",
    period: "/month",
    description: "Complete solution for large enterprises",
    features: [
      "Unlimited AutoChat Agents",
      "Unlimited messages",
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

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {pricingPlans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
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
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.buttonVariant}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                <div>
                  <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, we provide a 14-day free trial for all plans without requiring a credit card.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
                  <p className="text-muted-foreground text-sm">
                    Absolutely! You can change your subscription plan anytime according to your business needs.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What about technical support?</h3>
                  <p className="text-muted-foreground text-sm">
                    All plans receive technical support. Professional and Enterprise plans get higher priority.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Is my data secure?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, we use enterprise-grade encryption and comply with international security standards.
                  </p>
                </div>
              </div>
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