// Layout untuk halaman yang memerlukan autentikasi pengguna
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AgentProvider } from "@/contexts/agent-context";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Checking authentication status
          </div>
        </div>
      </div>
    );
  }

  // If user is not logged in, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // Render protected page for logged in users
  return (
    <AgentProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AgentProvider>
  );
}
