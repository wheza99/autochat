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

import { Edit } from "lucide-react";
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

  const handleSave = () => {
    onSave();
    setIsDialogOpen(false);
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
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
