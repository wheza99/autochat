// Halaman billing untuk mengelola informasi pembayaran pengguna
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AgentProvider, useAgent } from "@/contexts/agent-context";

interface BillingInfo {
  id: string;
  user_id: string;
  card_holder_name: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  billing_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  created_at?: string;
  updated_at?: string;
}

function BillingContent() {
  const { user } = useAuth();
  const { selectedAgent } = useAgent();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [formData, setFormData] = useState({
    card_holder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
    billing_address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  const loadBillingInfo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("billing_info")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setBillingInfo(data);
        setFormData({
          card_holder_name: data.card_holder_name || "",
          card_number: data.card_number || "",
          expiry_month: data.expiry_month || "",
          expiry_year: data.expiry_year || "",
          cvv: data.cvv || "",
          billing_address: data.billing_address || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          country: data.country || "",
        });
      }
    } catch (error) {
      console.error("Error loading billing info:", error);
      toast.error("Failed to load billing information");
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadBillingInfo();
    }
  }, [user, loadBillingInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const billingData = {
        user_id: user?.id,
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (billingInfo) {
        // Update existing billing info
        const { error } = await supabase
          .from("billing_info")
          .update(billingData)
          .eq("id", billingInfo.id);

        if (error) throw error;
      } else {
        // Create new billing info
        const { error } = await supabase.from("billing_info").insert({
          ...billingData,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success("Billing information updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating billing info:", error);
      toast.error("Failed to update billing information");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({ ...formData, card_number: formatted });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You must be logged in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
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
                <BreadcrumbLink href="/dashboard">
                  {selectedAgent?.name || "Dashboard"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Billing Information</h1>
            <p className="text-muted-foreground">
              Manage your billing and payment information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Update your billing and payment details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={user.user_metadata?.full_name || user.email}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(
                      user.user_metadata?.full_name ||
                        user.email?.split("@")[0] ||
                        "U"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="card_holder_name"
                    className="text-sm font-medium"
                  >
                    Card Holder Name
                  </Label>
                  <Input
                    id="card_holder_name"
                    type="text"
                    placeholder="Enter cardholder name"
                    value={formData.card_holder_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        card_holder_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card_number" className="text-sm font-medium">
                    Card Number
                  </Label>
                  <Input
                    id="card_number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.card_number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="expiry_month"
                      className="text-sm font-medium"
                    >
                      Month
                    </Label>
                    <Select
                      value={formData.expiry_month}
                      onValueChange={(value) =>
                        setFormData({ ...formData, expiry_month: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, "0");
                          return (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="expiry_year"
                      className="text-sm font-medium"
                    >
                      Year
                    </Label>
                    <Select
                      value={formData.expiry_year}
                      onValueChange={(value) =>
                        setFormData({ ...formData, expiry_year: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = (
                            new Date().getFullYear() + i
                          ).toString();
                          return (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-sm font-medium">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="billing_address"
                    className="text-sm font-medium"
                  >
                    Billing Address
                  </Label>
                  <Input
                    id="billing_address"
                    type="text"
                    placeholder="Enter billing address"
                    value={formData.billing_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_address: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip_code" className="text-sm font-medium">
                      ZIP/Postal Code
                    </Label>
                    <Input
                      id="zip_code"
                      type="text"
                      placeholder="Enter ZIP code"
                      value={formData.zip_code}
                      onChange={(e) =>
                        setFormData({ ...formData, zip_code: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData({ ...formData, country: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="ID">Indonesia</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="MY">Malaysia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save Billing Information"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function BillingPage() {
  return (
    <AgentProvider>
      <BillingContent />
    </AgentProvider>
  );
}
