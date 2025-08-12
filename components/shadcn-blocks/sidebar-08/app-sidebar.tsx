// Sidebar utama aplikasi dengan navigasi dan manajemen agent
"use client";

import * as React from "react";
import {
  Bot,
  Eye,
  EyeOff,
  Frame,
  Map,
  PieChart,
  Plus,
  QrCode,
  CheckCircle,
  Loader2,
} from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useAgent } from "@/contexts/agent-context";
import { DeviceManagement } from "@/components/device-management";
import { DeviceUsageCard } from "@/components/device-usage-card";

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
  navMain: [],
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
  const { loadAgents } = useAgent();
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = React.useState(false);
  const [isDeviceManagementOpen, setIsDeviceManagementOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [newAgentForm, setNewAgentForm] = React.useState({
    name: '',
    phone: '',
    model: '',
    system_prompt: '',
    api_key: ''
  });
  const [qrData, setQrData] = React.useState<string | null>(null);
  const [sessionData, setSessionData] = React.useState<any>(null);
  const [isGeneratingQR, setIsGeneratingQR] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [pollingInterval, setPollingInterval] = React.useState<NodeJS.Timeout | null>(null);

  // Load user profile from database
  const loadUserProfile = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('user')
        .select('*')
        .eq('id', user.id)
        .is('deleted_at', null)
        .single();
      
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
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
    (window as Window & { reloadUserProfile?: () => Promise<void> }).reloadUserProfile = loadUserProfile;
    return () => {
      delete (window as Window & { reloadUserProfile?: () => Promise<void> }).reloadUserProfile;
    };
  }, [loadUserProfile]);

  // Generate QR Code for WhatsApp connection
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const credentials = btoa('wheza99@gmail.com:b4ZXVkenVp7xMPe');
      const response = await fetch('https://app.notif.my.id/ss/scanorpairing', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('QR Generated:', data);
        setQrData(data.qr);
        setSessionData(data);
        
        // Start polling for connection status
        startPolling(data.session);
      } else {
        console.error('Failed to generate QR code');
        alert('Failed to generate QR code. Please try again.');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Start polling for connection status
  const startPolling = (sessionId: string) => {
    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const credentials = btoa('wheza99@gmail.com:b4ZXVkenVp7xMPe');
        const response = await fetch(`https://app.notif.my.id/ss/status/${sessionId}`, {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        });
        
        if (response.ok) {
          const statusData = await response.json();
          console.log('Status Check:', statusData);
          
          if (statusData.status === 'connected' && statusData.phone) {
            console.log('WhatsApp Connected Successfully:', statusData);
            
            // Auto-fill form with connection data
            const phoneNumber = statusData.phone.replace('@s.whatsapp.net', '');
            setNewAgentForm(prev => ({
              ...prev,
              phone: phoneNumber,
              api_key: sessionData?.apikey || ''
            }));
            
            setIsConnected(true);
            clearInterval(interval);
            setPollingInterval(null);
            
            alert('WhatsApp connected successfully! Phone and API key have been auto-filled.');
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
    
    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPollingInterval(null);
    }, 120000);
  };

  // Cleanup polling on unmount or dialog close
  React.useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Reset QR state when dialog closes
  const resetQRState = () => {
    setQrData(null);
    setSessionData(null);
    setIsConnected(false);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

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
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2">
          {/* Device Usage Card */}
          <DeviceUsageCard onManageClick={() => setIsDeviceManagementOpen(true)} />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      
      {/* Add Agent Dialog */}
      <Dialog open={isAddAgentDialogOpen} onOpenChange={setIsAddAgentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add New Agent</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a new AI agent with custom configuration and WhatsApp integration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b pb-2">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name" className="text-sm font-medium">
                    Agent Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="agent-name"
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a unique name for your agent"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-model" className="text-sm font-medium">
                    AI Model
                  </Label>
                  <Select value={newAgentForm.model} onValueChange={(value) => setNewAgentForm(prev => ({ ...prev, model: value }))}>
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
                    onChange={(e) => setNewAgentForm(prev => ({ ...prev, system_prompt: e.target.value }))}
                    className="min-h-[120px] max-h-[200px] resize-none"
                    placeholder="Define your agent's personality, role, and behavior instructions..."
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt will guide how your agent responds to messages.
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Connection Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b pb-2">WhatsApp Integration</h3>
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    <span>WhatsApp Connection</span>
                    {isConnected && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Connect your WhatsApp account to automatically configure phone number and API key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant={isConnected ? "secondary" : "outline"} 
                    size="sm" 
                    className="w-full"
                    onClick={generateQRCode}
                    disabled={isGeneratingQR || isConnected}
                  >
                    {isGeneratingQR ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating QR Code...
                      </>
                    ) : isConnected ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        WhatsApp Connected
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                  
                  {qrData && !isConnected && (
                    <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-3 bg-white rounded-lg border shadow-sm">
                        <img 
                          src={qrData} 
                          alt="WhatsApp QR Code" 
                          className="w-40 h-40 object-contain"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          Scan with WhatsApp
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Open WhatsApp → Settings → Linked Devices → Link a Device
                        </p>
                        {sessionData && (
                          <p className="text-xs text-muted-foreground font-mono bg-gray-100 px-2 py-1 rounded">
                            Session: {sessionData.session}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="agent-phone"
                    value={newAgentForm.phone}
                    onChange={(e) => setNewAgentForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Auto-filled from QR scan"
                    readOnly={isConnected}
                    className={isConnected ? "bg-gray-50" : ""}
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
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, api_key: e.target.value }))}
                      className={`pr-10 ${isConnected ? "bg-gray-50" : ""}`}
                      placeholder="Auto-filled from QR scan"
                      readOnly={isConnected}
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
                setNewAgentForm({ name: '', phone: '', model: '', system_prompt: '', api_key: '' });
                setShowApiKey(false);
                resetQRState();
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
                'Create Agent'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Device Management Dialog */}
      <DeviceManagement 
        open={isDeviceManagementOpen} 
        onOpenChange={setIsDeviceManagementOpen} 
      />
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
      
      const { error } = await supabase
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
      resetQRState();
      
      alert('Agent created successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }
}
