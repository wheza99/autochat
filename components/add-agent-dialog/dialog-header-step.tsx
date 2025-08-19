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
        {currentStep === 1 ? "Add New Agent" : "Choose Your Plan"}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        {currentStep === 1
          ? "Create a new AI agent with custom configuration and WhatsApp integration."
          : "Select a pricing plan for your new agent."}
      </DialogDescription>
    </DialogHeader>
  );
}
