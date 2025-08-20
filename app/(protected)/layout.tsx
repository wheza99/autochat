// Layout untuk halaman yang memerlukan autentikasi pengguna
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AgentProvider } from "@/contexts/agent-context";
import { useAgent } from "@/contexts/agent-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// Header component that uses agent context
function ProtectedHeader() {
  const { selectedAgent } = useAgent();

  return (
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  {selectedAgent.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
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
        <SidebarInset>
          <ProtectedHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AgentProvider>
  );
}
