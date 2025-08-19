"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useAgent } from "@/contexts/agent-context";

interface AgentForm {
  name: string;
  phone: string;
  model: string;
  system_prompt: string;
  api_key: string;
}

interface AddAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Pricing plans data
const pricingPlans = [
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
  const calculatePrice = (
    basePrice: number | string,
    messageCount: number,
    baseMessages: number
  ) => {
    if (typeof basePrice === "string") {
      return basePrice;
    }

    // Calculate price based on selected message count
    const calculatedPrice = Math.round(basePrice);

    return `Rp ${calculatedPrice.toLocaleString("id-ID")}`;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!newAgentForm.name.trim()) {
        alert("Agent name is required");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {currentStep === 1 ? "Add New Agent" : "Choose Your Plan"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {currentStep === 1
              ? "Create a new AI agent with custom configuration and WhatsApp integration."
              : "Select a pricing plan for your new agent."}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b pb-2">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name" className="text-sm font-medium">
                    Agent Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="agent-name"
                    value={newAgentForm.name}
                    onChange={(e) =>
                      setNewAgentForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter a unique name for your agent"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-model" className="text-sm font-medium">
                    AI Model
                  </Label>
                  <Select
                    value={newAgentForm.model}
                    onValueChange={(value) =>
                      setNewAgentForm((prev) => ({ ...prev, model: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select AI model for your agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-prompt" className="text-sm font-medium">
                    System Prompt
                  </Label>
                  <Textarea
                    id="agent-prompt"
                    value={newAgentForm.system_prompt}
                    onChange={(e) =>
                      setNewAgentForm((prev) => ({
                        ...prev,
                        system_prompt: e.target.value,
                      }))
                    }
                    className="min-h-[120px] max-h-[200px] resize-none"
                    placeholder="Define your agent's personality, role, and behavior instructions..."
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt will guide how your agent responds to messages.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Configuration Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b pb-2">
                Additional Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="agent-phone"
                    value={newAgentForm.phone}
                    onChange={(e) =>
                      setNewAgentForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="agent-api-key"
                    className="text-sm font-medium"
                  >
                    API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="agent-api-key"
                      type={showApiKey ? "text" : "password"}
                      value={newAgentForm.api_key}
                      onChange={(e) =>
                        setNewAgentForm((prev) => ({
                          ...prev,
                          api_key: e.target.value,
                        }))
                      }
                      className="pr-10"
                      placeholder="Enter API key (optional)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 py-4">
            {/* Billing Toggle */}
            <div className="flex items-start justify-start gap-4">
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

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative flex flex-col h-full cursor-pointer transition-all ${
                    plan.popular ? "border-primary shadow-md" : ""
                  } ${
                    selectedPlan === plan.name
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                      Most Popular
                    </Badge>
                  )}

                  {selectedPlan === plan.name && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}

                  <CardHeader className="text-center pb-3">
                    <CardTitle className="text-lg font-bold">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-3">
                      <span className="text-xl font-bold">
                        {calculatePrice(
                          isYearly ? plan.yearlyPrice : plan.monthlyPrice,
                          plan.baseMessages,
                          plan.baseMessages
                        )}
                      </span>
                      {typeof (isYearly
                        ? plan.yearlyPrice
                        : plan.monthlyPrice) !== "string" && (
                        <span className="text-muted-foreground text-sm">
                          {isYearly ? "/year" : "/month"}
                        </span>
                      )}
                    </div>

                    {/* Message Limit Display */}
                    <div className="mt-3 p-2 border rounded-lg bg-muted/50">
                      <div className="text-sm font-semibold text-primary">
                        {plan.messageLimit === "Custom" ||
                        plan.messageLimit === "Unlimited"
                          ? `${plan.messageLimit} messages`
                          : `${formatMessageCount(
                              plan.baseMessages
                            )} messages/month`}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col pt-0">
                    <ul className="space-y-2 mb-4 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-3 w-3 text-primary flex-shrink-0" />
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleCancel : handleBack}
            disabled={isCreating}
            className="w-full sm:w-auto"
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={currentStep === 1 ? handleNext : handleCreateAgent}
            disabled={
              isCreating ||
              (currentStep === 1 && !newAgentForm.name.trim()) ||
              (currentStep === 2 && !selectedPlan)
            }
            className="w-full sm:w-auto"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Agent...
              </>
            ) : currentStep === 1 ? (
              "Next"
            ) : (
              "Create Agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
