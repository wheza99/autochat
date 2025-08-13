// Halaman Plan & Billing untuk mengelola subscription dan riwayat pembayaran
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Calendar, Download } from "lucide-react";
import { AgentProvider } from "@/contexts/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Interface untuk subscription plan
interface SubscriptionPlan {
  id: string;
  name: string;
  status: string;
  expire_date: string;
  created_at: string;
}

// Interface untuk billing history
interface BillingHistory {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: string;
}

function PlanBillingContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Simulate subscription data - replace with actual API call
      setSubscriptionPlan({
        id: "1",
        name: "Pro",
        status: "active",
        expire_date: "2025/09/12 10:15",
        created_at: "2025/08/13 10:15"
      });

      // Simulate billing history - replace with actual API call
      setBillingHistory([
        {
          id: "1",
          name: "Pro Plan",
          amount: "$10",
          date: "2025/08/13 10:15",
          status: "completed"
        }
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const handleResubscribe = () => {
    // Redirect to pricing page or handle resubscription
    window.location.href = '/pricing';
  };

  const handleObtainInvoice = (billingId: string) => {
    // Handle invoice download
    toast.success('Invoice download started');
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Plan & Billings</h1>
        <p className="text-muted-foreground">
          View your subscription plan, billings information.
        </p>
      </div>

      {/* Subscription Plan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Plan:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      {subscriptionPlan.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Expire at:</span>
                    <span className="text-sm font-medium">{subscriptionPlan.expire_date}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleResubscribe}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Resubscribe
                </Button>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your Pro plan will expire soon. Resubscribe to restore your benefits.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active subscription found</p>
              <Button onClick={handleResubscribe} className="mt-4">
                Subscribe Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell className="font-medium">{billing.name}</TableCell>
                    <TableCell>{billing.amount}</TableCell>
                    <TableCell>{billing.date}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleObtainInvoice(billing.id)}
                        className="text-blue-600 hover:text-blue-800 underline p-0 h-auto"
                      >
                        Obtain invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No billing history found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlanPage() {
  return (
    <AgentProvider>
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
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Plan & Billings</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <PlanBillingContent />
        </SidebarInset>
      </SidebarProvider>
    </AgentProvider>
  );
}