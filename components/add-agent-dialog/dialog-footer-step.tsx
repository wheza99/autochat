import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogFooterStepProps } from "./types";

export function DialogFooterStep({
  currentStep,
  isCreating,
  newAgentForm,
  selectedPlan,
  handleCancel,
  handleBack,
  handleNext,
  handleCreateAgent,
}: DialogFooterStepProps) {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
      <Button
        variant="outline"
        onClick={currentStep === 1 ? handleCancel : handleBack}
        disabled={isCreating}
        className="w-full sm:w-auto"
      >
        {currentStep === 1 ? "Cancel" : "Back"}
      </Button>
      {currentStep < 3 && (
        <Button
          onClick={handleNext}
          disabled={
            isCreating ||
            (currentStep === 1 && !newAgentForm.name.trim()) ||
            (currentStep === 2 && !selectedPlan)
          }
          className="w-full sm:w-auto"
        >
          {currentStep === 1 ? "Next" : "Proceed to Payment"}
        </Button>
      )}
      {currentStep === 3 && (
        <Button
          onClick={handleCreateAgent}
          disabled={isCreating}
          className="w-full sm:w-auto"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Agent...
            </>
          ) : (
            "Create Agent"
          )}
        </Button>
      )}
    </DialogFooter>
  );
}
