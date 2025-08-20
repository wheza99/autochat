// Sidebar utama aplikasi dengan navigasi dan manajemen agent
"use client";

import * as React from "react";
import { Plus, Bot } from "lucide-react";
import { NavAgents } from "./nav-agents";
import { NavUser } from "./nav-user";
import { AddAgentDialog } from "@/components/add-agent-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth();
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    null
  );
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
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="#">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
                <Bot className="size-8" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none pb-4">
                <span className="text-lg">Ragna</span>
                <span className="text-xs">Manage RAG dengan sempurna</span>
              </div>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1">
              <Button
                onClick={() => setIsAddAgentDialogOpen(true)}
                className="w-full justify-start"
              >
                <Plus className="size-4 mr-2" />
                New Agent
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavAgents />
      </SidebarContent>

      {/* Account */}
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      {/* Add Agent Dialog */}
      <AddAgentDialog
        open={isAddAgentDialogOpen}
        onOpenChange={setIsAddAgentDialogOpen}
      />
    </Sidebar>
  );
}
