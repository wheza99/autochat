"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/shadcn-blocks/sidebar-08/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AgentProvider } from "@/contexts/agent-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Settings, Save, RotateCcw } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Inner component that uses the agent context
function SystemPromptContent() {
  const { selectedAgent, updateAgent } = useAgent();
  const [systemPrompt, setSystemPrompt] = useState(selectedAgent?.system_prompt || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when selected agent changes
  useEffect(() => {
    setSystemPrompt(selectedAgent?.system_prompt || '');
    setHasChanges(false);
  }, [selectedAgent]);

  const handlePromptChange = (value: string) => {
    setSystemPrompt(value);
    setHasChanges(value !== (selectedAgent?.system_prompt || ''));
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          system_prompt: systemPrompt,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAgent.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating system prompt:', error);
        toast.error('Failed to save system prompt. Please try again.');
        return;
      }
      
      if (data) {
        updateAgent(data);
        setHasChanges(false);
        toast.success('System prompt saved successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSystemPrompt(selectedAgent?.system_prompt || '');
    setHasChanges(false);
  };

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Select an Agent</h2>
          <p className="text-muted-foreground">Choose an agent from the sidebar to edit its system prompt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">System Prompt</h1>
        <p className="text-muted-foreground">
          Configure the system prompt for <span className="font-medium">{selectedAgent.name}</span>
        </p>
      </div>

      {/* System Prompt Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>System Prompt Configuration</span>
          </CardTitle>
          <CardDescription>
            Define how your agent should behave and respond to messages. This prompt will guide the AI's personality, tone, and capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="border rounded-md w-full">
               <Textarea
                 value={systemPrompt}
                 onChange={(e) => handlePromptChange(e.target.value)}
                 placeholder="Enter system prompt instructions...\n\nExample:\nYou are a helpful AI assistant. You should:\n- Be polite and professional\n- Provide accurate and helpful information\n- Ask clarifying questions when needed\n- Keep responses concise but informative"
                 className="min-h-[300px] max-h-[300px] font-mono text-sm resize-none border-0 focus:ring-0 focus:outline-none overflow-y-auto p-4"
                 style={{ 
                   wordWrap: 'break-word', 
                   overflowWrap: 'break-word',
                   whiteSpace: 'pre-wrap'
                 }}
               />
             </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {hasChanges && (
                <span className="text-amber-600">• Unsaved changes</span>
              )}
            </div>
            <div className="flex space-x-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}

function PageContent() {
  const { selectedAgent } = useAgent();
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {selectedAgent && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/agent_info">
                        {selectedAgent.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>System Prompt</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <SystemPromptContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <AgentProvider>
      <PageContent />
    </AgentProvider>
  );
}