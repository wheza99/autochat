// Dialog untuk mengedit informasi dasar agent
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface BasicInfoForm {
  name: string;
  phone: string;
  model: string;
  api_key: string;
}

interface EditBasicInfoDialogProps {
  basicInfoForm: BasicInfoForm;
  onFormChange: (form: BasicInfoForm) => void;
  onSave: () => void;
  onDialogOpenChange?: (open: boolean) => void;
}

export function EditBasicInfoDialog({
  basicInfoForm,
  onFormChange,
  onSave,
  onDialogOpenChange,
}: EditBasicInfoDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showApiKeyInEdit, setShowApiKeyInEdit] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    onDialogOpenChange?.(open);
  };

  const handleFormChange = (field: keyof BasicInfoForm, value: string) => {
    onFormChange({
      ...basicInfoForm,
      [field]: value,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="w-full">
          <Edit className="h-4 w-4" />
          <span>Edit Agent</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Agent Information</DialogTitle>
          <DialogDescription>
            Update the basic information for this agent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={basicInfoForm.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={basicInfoForm.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select
              value={basicInfoForm.model}
              onValueChange={(value) => handleFormChange("model", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3">Claude 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api_key" className="text-right">
              API Key
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="api_key"
                type={showApiKeyInEdit ? "text" : "password"}
                value={basicInfoForm.api_key}
                onChange={(e) => handleFormChange("api_key", e.target.value)}
                className="pr-8"
                placeholder="Enter API key"
              />
              <button
                type="button"
                onClick={() => setShowApiKeyInEdit(!showApiKeyInEdit)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showApiKeyInEdit ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
