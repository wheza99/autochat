// Komponen konten Basic Information untuk tab Basic
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, Calendar, Phone, Settings, MessageSquare, Edit, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { supabase } from "@/lib/supabase";

export function BasicInformationContent() {
  const { selectedAgent, updateAgent } = useAgent();
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [isBasicInfoDialogOpen, setIsBasicInfoDialogOpen] = useState(false);
  const [isSystemPromptDialogOpen, setIsSystemPromptDialogOpen] = useState(false);
  const [basicInfoForm, setBasicInfoForm] = useState({
    name: '',
    phone: '',
    model: '',
    api_key: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKeyInEdit, setShowApiKeyInEdit] = useState(false);
  const [systemPromptForm, setSystemPromptForm] = useState('');

  const handleEditBasicInfo = () => {
    if (selectedAgent) {
      // Remove @s.whatsapp.net suffix for display
      const displayPhone = selectedAgent.phone 
        ? String(selectedAgent.phone).replace('@s.whatsapp.net', '') 
        : '';
      
      setBasicInfoForm({
        name: selectedAgent.name || '',
        phone: displayPhone,
        model: selectedAgent.model || '',
        api_key: selectedAgent.api_key || ''
      });
      setIsBasicInfoDialogOpen(true);
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
        .from('agents')
        .update({
          name: basicInfoForm.name,
          phone: formattedPhone,
          model: basicInfoForm.model,
          api_key: basicInfoForm.api_key || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAgent.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating agent:', error);
        alert('Failed to save changes. Please try again.');
        return;
      }
      
      if (data) {
        updateAgent(data);
      }
      
      setIsBasicInfoDialogOpen(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleEditSystemPrompt = () => {
    if (selectedAgent) {
      setSystemPromptForm(selectedAgent.system_prompt || '');
      setIsSystemPromptDialogOpen(true);
    }
  };

  const handleSaveSystemPrompt = async () => {
    if (!selectedAgent) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          system_prompt: systemPromptForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAgent.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating agent:', error);
        alert('Failed to save changes. Please try again.');
        return;
      }
      
      if (data) {
        updateAgent(data);
      }
      
      setIsSystemPromptDialogOpen(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-1">Select an Agent</h2>
          <p className="text-sm text-muted-foreground">Choose an agent from the sidebar</p>
        </div>
      </div>
    );
  }

  const agent = selectedAgent;

  return (
    <div className="space-y-3">
      {/* Basic Information */}
      <Collapsible open={isBasicInfoOpen} onOpenChange={setIsBasicInfoOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="py-1">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Settings className="h-3.5 w-3.5" />
                  <span>Basic Information</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 px-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBasicInfo();
                    }}
                  >
                    <Edit className="h-2.5 w-2.5" />
                  </Button>
                  <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isBasicInfoOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-1 py-1">
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <p className="text-xs truncate">{agent.name || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center space-x-0.5">
                      <Phone className="h-2.5 w-2.5" />
                      <span>Phone</span>
                    </label>
                    <p className="text-xs">{agent.phone ? agent.phone.replace('@s.whatsapp.net', '') : 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Model</label>
                    <div className="mt-0.5">
                      {agent.model ? (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{agent.model}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">API Key</label>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs">
                        {agent.api_key ? 
                          (showApiKey ? agent.api_key : '••••••••••••••••') : 
                          'Not specified'
                        }
                      </p>
                      {agent.api_key && (
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showApiKey ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center space-x-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>Created</span>
                    </label>
                    <p className="text-xs">{new Date(agent.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </CollapsibleTrigger>
      </Collapsible>

      {/* System Prompt */}
      <Collapsible open={isSystemPromptOpen} onOpenChange={setIsSystemPromptOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="py-1">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>System Prompt</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 px-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSystemPrompt();
                    }}
                  >
                    <Edit className="h-2.5 w-2.5" />
                  </Button>
                  <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isSystemPromptOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="py-1">
                {agent.system_prompt ? (
                  <div className="bg-muted/50 rounded-md p-1.5">
                    <pre className="text-xs whitespace-pre-wrap font-mono max-h-24 overflow-y-auto leading-relaxed">{agent.system_prompt}</pre>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No system prompt configured</p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </CollapsibleTrigger>
      </Collapsible>

      {/* Basic Information Dialog */}
      <Dialog open={isBasicInfoDialogOpen} onOpenChange={setIsBasicInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Basic Information</DialogTitle>
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
                onChange={(e) => setBasicInfoForm(prev => ({ ...prev, name: e.target.value }))}
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
                onChange={(e) => setBasicInfoForm(prev => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Select value={basicInfoForm.model} onValueChange={(value) => setBasicInfoForm(prev => ({ ...prev, model: value }))}>
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
                  onChange={(e) => setBasicInfoForm(prev => ({ ...prev, api_key: e.target.value }))}
                  className="pr-8"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKeyInEdit(!showApiKeyInEdit)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKeyInEdit ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveBasicInfo}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Prompt Dialog */}
      <Dialog open={isSystemPromptDialogOpen} onOpenChange={setIsSystemPromptDialogOpen}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Edit System Prompt</DialogTitle>
            <DialogDescription>
              Configure the system prompt instructions for this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-hidden">
            <Textarea
              value={systemPromptForm}
              onChange={(e) => setSystemPromptForm(e.target.value)}
              placeholder="Enter system prompt instructions..."
              className="w-full h-full font-mono text-sm resize-none border-0 focus:ring-0 focus:outline-none p-0 break-words overflow-wrap-anywhere overflow-y-auto"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setIsSystemPromptDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSaveSystemPrompt}>
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}