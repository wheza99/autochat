import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogHeaderStepProps } from "./types";

export function DialogHeaderStep({ currentStep }: DialogHeaderStepProps) {
  return (
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold">
        {currentStep === 1
          ? "Add New Agent"
          : currentStep === 2
          ? "Choose Your Plan"
          : "Payment"}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        {currentStep === 1
          ? "Create a new AI agent with custom configuration and WhatsApp integration."
          : currentStep === 2
          ? "Select a pricing plan for your new agent."
          : "Complete your payment to create the agent."}
      </DialogDescription>
    </DialogHeader>
  );
}
