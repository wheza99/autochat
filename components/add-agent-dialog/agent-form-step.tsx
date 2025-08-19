import { Eye, EyeOff } from "lucide-react";
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
import { AgentFormStepProps } from "./types";

export function AgentFormStep({
  newAgentForm,
  setNewAgentForm,
  showApiKey,
  setShowApiKey,
}: AgentFormStepProps) {
  return (
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
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
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
            <Label htmlFor="agent-api-key" className="text-sm font-medium">
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
  );
}
