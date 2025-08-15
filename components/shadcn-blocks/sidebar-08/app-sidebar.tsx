// Sidebar utama aplikasi dengan navigasi dan manajemen agent
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bot,
  Eye,
  EyeOff,
  Frame,
  Map,
  PieChart,
  Plus,
  Loader2,
  ChevronsUpDown,
  Info,
  FileText,
  MessageCircle,
  MessageSquare,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/shadcn-blocks/sidebar-08/nav-main";

import { NavUser } from "@/components/shadcn-blocks/sidebar-08/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useAgent } from "@/contexts/agent-context";
// Device management components disabled as requested
// import { DeviceManagement } from "@/components/device-management";
// import { DeviceUsageCard } from "@/components/device-usage-card";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Agent Info",
      url: "/agent_info",
      icon: Info,
    },
    {
      title: "System Prompt",
      url: "/system_prompt",
      icon: Settings,
    },
    {
      title: "Documents",
      url: "/document",
      icon: FileText,
    },
    {
      title: "WhatsApp",
      url: "/whatsapp",
      icon: MessageSquare,
    },
  ],
  navSecondary: [],
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
  const { agents, selectedAgent, setSelectedAgent, loadAgents } = useAgent();
  const { isMobile } = useSidebar();
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = React.useState(false);
  // Device management disabled as requested
  // const [isDeviceManagementOpen, setIsDeviceManagementOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    null
  );
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [newAgentForm, setNewAgentForm] = React.useState({
    name: "",
    phone: "",
    model: "",
    system_prompt: "",
    api_key: "",
  });

  // Load user profile from database
  const loadUserProfile = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .is("deleted_at", null)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
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
    const displayName =
      userProfile?.name ||
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
    (
      window as Window & { reloadUserProfile?: () => Promise<void> }
    ).reloadUserProfile = loadUserProfile;
    return () => {
      delete (window as Window & { reloadUserProfile?: () => Promise<void> })
        .reloadUserProfile;
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Bot className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {selectedAgent
                        ? selectedAgent.name
                        : agents.length > 0
                        ? agents[0].name
                        : "No Agents"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Agents
                </DropdownMenuLabel>
                {agents.length === 0 ? (
                  <DropdownMenuItem disabled className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Bot className="size-3.5 shrink-0" />
                    </div>
                    No agents found
                  </DropdownMenuItem>
                ) : (
                  agents.map((agent, index) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Bot className="size-3.5 shrink-0" />
                      </div>
                      {agent.name || "Unnamed Agent"}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsAddAgentDialogOpen(true)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add Agent
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="px-2 py-1">
              <Button asChild className="w-full justify-start">
                <Link href="/chat">
                  <MessageCircle className="size-4 mr-2" />
                  Chat
                </Link>
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {/* Device Usage Card - Hidden as requested */}
        {/* <div className="px-2 pb-2">
          <DeviceUsageCard onManageClick={() => setIsDeviceManagementOpen(true)} />
        </div> */}
        <NavUser user={userData} />
      </SidebarFooter>

      {/* Add Agent Dialog */}
      <Dialog
        open={isAddAgentDialogOpen}
        onOpenChange={setIsAddAgentDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add New Agent
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a new AI agent with custom configuration and WhatsApp
              integration.
            </DialogDescription>
          </DialogHeader>

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
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
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
                  <Label
                    htmlFor="agent-api-key"
                    className="text-sm font-medium"
                  >
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

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddAgentDialogOpen(false);
                setNewAgentForm({
                  name: "",
                  phone: "",
                  model: "",
                  system_prompt: "",
                  api_key: "",
                });
                setShowApiKey(false);
              }}
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={isCreating || !newAgentForm.name.trim()}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Device Management Dialog - Disabled as requested */}
      {/* <DeviceManagement 
        open={isDeviceManagementOpen} 
        onOpenChange={setIsDeviceManagementOpen} 
      /> */}
    </Sidebar>
  );

  async function handleCreateAgent() {
    if (!newAgentForm.name.trim()) {
      alert("Agent name is required");
      return;
    }

    setIsCreating(true);

    try {
      // Format phone number with WhatsApp suffix if provided
      const formattedPhone = newAgentForm.phone.trim()
        ? `${newAgentForm.phone.trim()}@s.whatsapp.net`
        : null;

      const { error } = await supabase
        .from("agents")
        .insert({
          name: newAgentForm.name.trim(),
          phone: formattedPhone,
          model: newAgentForm.model || null,
          system_prompt: newAgentForm.system_prompt.trim() || null,
          api_key: newAgentForm.api_key.trim() || null,
          user_id: user?.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating agent:", error);
        alert("Failed to create agent. Please try again.");
        return;
      }

      // Refresh agents list
      await loadAgents();

      // Reset form and close dialog
      setNewAgentForm({
        name: "",
        phone: "",
        model: "",
        system_prompt: "",
        api_key: "",
      });
      setIsAddAgentDialogOpen(false);
      setShowApiKey(false);

      alert("Agent created successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }
}
