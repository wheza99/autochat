export interface AgentForm {
  name: string;
  phone: string;
  model: string;
  system_prompt: string;
  api_key: string;
}

export interface AddAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface PricingPlan {
  name: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  description: string;
  messageLimit: string;
  baseMessages: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonVariant: "outline" | "default";
}

export interface DialogHeaderStepProps {
  currentStep: number;
}

export interface AgentFormStepProps {
  newAgentForm: AgentForm;
  setNewAgentForm: React.Dispatch<React.SetStateAction<AgentForm>>;
  showApiKey: boolean;
  setShowApiKey: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface PricingStepProps {
  isYearly: boolean;
  setIsYearly: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPlan: string | null;
  handlePlanSelect: (planName: string) => void;
  pricingPlans: PricingPlan[];
  calculatePrice: (
    basePrice: number | string,
    messageCount: number,
    baseMessages: number
  ) => string;
  formatMessageCount: (value: number) => string;
}

export interface DialogFooterStepProps {
  currentStep: number;
  isCreating: boolean;
  newAgentForm: AgentForm;
  selectedPlan: string | null;
  handleCancel: () => void;
  handleBack: () => void;
  handleNext: () => void;
  handleCreateAgent: () => void;
}
