import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingStepProps } from "./types";

export function PricingStep({
  isYearly,
  setIsYearly,
  selectedPlan,
  handlePlanSelect,
  pricingPlans,
  calculatePrice,
  formatMessageCount,
}: PricingStepProps) {
  return (
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
              <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
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
                {typeof (isYearly ? plan.yearlyPrice : plan.monthlyPrice) !==
                  "string" && (
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
                    : `${formatMessageCount(plan.baseMessages)} messages/month`}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col pt-0">
              <ul className="space-y-2 mb-4 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
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
  );
}
