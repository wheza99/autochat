// Komponen konten Basic Information untuk tab Basic
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditBasicInfoDialog } from "./edit-basic-info-dialog";
import { Bot, Calendar, Phone, Eye, EyeOff, BotIcon } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { supabase } from "@/lib/supabase";

export function BasicInformationContent() {
  const { selectedAgent, updateAgent } = useAgent();
  const [basicInfoForm, setBasicInfoForm] = useState({
    name: "",
    phone: "",
    model: "",
    api_key: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleFormChange = (form: typeof basicInfoForm) => {
    setBasicInfoForm(form);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open && selectedAgent) {
      // Remove @s.whatsapp.net suffix for display
      const displayPhone = selectedAgent.phone
        ? String(selectedAgent.phone).replace("@s.whatsapp.net", "")
        : "";

      setBasicInfoForm({
        name: selectedAgent.name || "",
        phone: displayPhone,
        model: selectedAgent.model || "",
        api_key: selectedAgent.api_key || "",
      });
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!selectedAgent) return;

    try {
      // Format phone number with WhatsApp suffix if provided
      const formattedPhone = basicInfoForm.phone.trim()
        ? `${basicInfoForm.phone.trim()}@s.whatsapp.net`
        : null;

      const { data, error } = await supabase
        .from("agents")
        .update({
          name: basicInfoForm.name,
          phone: formattedPhone,
          model: basicInfoForm.model,
          api_key: basicInfoForm.api_key || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAgent.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating agent:", error);
        alert("Failed to save changes. Please try again.");
        return;
      }

      if (data) {
        updateAgent(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Select an Agent</h2>
          <p className="text-base text-muted-foreground">
            Choose an agent from the sidebar to view its information
          </p>
        </div>
      </div>
    );
  }

  const agent = selectedAgent;

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center space-x-3 text-md font-semibold">
            <BotIcon className="h-6 w-6" />
            <span>Agent Info</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Agent Name
                </label>
                <p className="text-base font-medium">
                  {agent.name || "Not specified"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                </label>
                <p className="text-base">
                  {agent.phone
                    ? agent.phone.replace("@s.whatsapp.net", "")
                    : "Not specified"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  AI Model
                </label>
                <div>
                  {agent.model ? (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {agent.model}
                    </Badge>
                  ) : (
                    <span className="text-base text-muted-foreground">
                      Not specified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  API Key
                </label>
                <div className="flex items-center space-x-3">
                  <p className="text-base font-mono">
                    {agent.api_key
                      ? showApiKey
                        ? agent.api_key
                        : "••••••••••••••••••••••••••••••••"
                      : "Not specified"}
                  </p>
                  {agent.api_key && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-8 w-8 p-0"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created Date</span>
                </label>
                <p className="text-base">
                  {new Date(agent.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <EditBasicInfoDialog
            basicInfoForm={basicInfoForm}
            onFormChange={handleFormChange}
            onSave={handleSaveBasicInfo}
            onDialogOpenChange={handleDialogOpenChange}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
