// Sidebar utama aplikasi dengan navigasi dan manajemen agent
"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Eye,
  EyeOff,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Plus,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/shadcn-blocks/sidebar-08/nav-main";
import { NavProjects } from "@/components/shadcn-blocks/sidebar-08/nav-projects";
import { NavSecondary } from "@/components/shadcn-blocks/sidebar-08/nav-secondary";
import { NavUser } from "@/components/shadcn-blocks/sidebar-08/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useAgent } from "@/contexts/agent-context";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth();
  const { loadAgents } = useAgent();
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [newAgentForm, setNewAgentForm] = React.useState({
    name: '',
    phone: '',
    model: '',
    system_prompt: '',
    api_key: ''
  });

  // Load user profile from database
  const loadUserProfile = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', user.id)
        .is('deleted_at', null)
        .single();
      
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [user?.id]);

  // Load user profile on mount and when user changes
  React.useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Generate user data from database or fallback to auth user
  const userData = React.useMemo(() => {
    if (!user) {
      return {
        name: "Guest User",
        email: "guest@example.com",
        avatar: "/avatars/default.jpg",
      };
    }

    // Use database profile if available, otherwise fallback to auth user
    const displayName = userProfile?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    return {
      name: displayName,
      email: user.email || "No email",
      avatar: user.user_metadata?.avatar_url || "/avatars/default.jpg",
    };
  }, [user, userProfile]);

  // Expose reload function globally for profile updates
  React.useEffect(() => {
    (window as any).reloadUserProfile = loadUserProfile;
    return () => {
      delete (window as any).reloadUserProfile;
    };
  }, [loadUserProfile]);

  if (loading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">AutoChat</span>
          </div>
        </div>
        <div className="px-2 pb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs h-8 bg-black text-white border-black hover:bg-gray-800 hover:text-white"
            onClick={() => setIsAddAgentDialogOpen(true)}
          >
            <Plus className="h-3 w-3 mr-2" />
            Add Agents
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      
      {/* Add Agent Dialog */}
      <Dialog open={isAddAgentDialogOpen} onOpenChange={setIsAddAgentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new AI agent with custom configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-name" className="text-right">
                Name *
              </Label>
              <Input
                id="agent-name"
                value={newAgentForm.name}
                onChange={(e) => setNewAgentForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Enter agent name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="agent-phone"
                value={newAgentForm.phone}
                onChange={(e) => setNewAgentForm(prev => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-model" className="text-right">
                Model
              </Label>
              <Select value={newAgentForm.model} onValueChange={(value) => setNewAgentForm(prev => ({ ...prev, model: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="agent-prompt" className="text-right pt-2">
                System Prompt
              </Label>
              <Textarea
                id="agent-prompt"
                value={newAgentForm.system_prompt}
                onChange={(e) => setNewAgentForm(prev => ({ ...prev, system_prompt: e.target.value }))}
                className="col-span-3 min-h-[100px] max-h-[200px] overflow-y-auto resize-none"
                placeholder="Enter system prompt instructions..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-api-key" className="text-right">
                API Key
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="agent-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={newAgentForm.api_key}
                  onChange={(e) => setNewAgentForm(prev => ({ ...prev, api_key: e.target.value }))}
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
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddAgentDialogOpen(false);
                setNewAgentForm({ name: '', phone: '', model: '', system_prompt: '', api_key: '' });
                setShowApiKey(false);
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAgent}
              disabled={isCreating || !newAgentForm.name.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
  
  async function handleCreateAgent() {
    if (!newAgentForm.name.trim()) {
      alert('Agent name is required');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Format phone number with WhatsApp suffix if provided
      const formattedPhone = newAgentForm.phone.trim() 
        ? `${newAgentForm.phone.trim()}@s.whatsapp.net`
        : null;
      
      const { data, error } = await supabase
        .from('agents')
        .insert({
          name: newAgentForm.name.trim(),
          phone: formattedPhone,
          model: newAgentForm.model || null,
          system_prompt: newAgentForm.system_prompt.trim() || null,
          api_key: newAgentForm.api_key.trim() || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating agent:', error);
        alert('Failed to create agent. Please try again.');
        return;
      }
      
      // Refresh agents list
      await loadAgents();
      
      // Reset form and close dialog
      setNewAgentForm({ name: '', phone: '', model: '', system_prompt: '', api_key: '' });
      setIsAddAgentDialogOpen(false);
      setShowApiKey(false);
      
      alert('Agent created successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }
}
