"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useAgent } from "@/contexts/agent-context";

interface Transaction {
  id: string;
  merchant_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  plan_name: string;
  status: string;
  tripay_reference: string | null;
  payment_method: string | null;
  checkout_url: string | null;
  expired_time: string | null;
  created_at: string;
  updated_at: string;
  agent_id: string | null;
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "created":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <CreditCard className="w-3 h-3 mr-1" />
          Created
        </Badge>
      );
    case "paid":
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="text-red-600 border-red-600">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TransactionSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { selectedAgent } = useAgent();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id || !selectedAgent?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .eq("agent_id", selectedAgent.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setTransactions(data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, selectedAgent?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <CreditCard className="h-6 w-6" />
            <span>Plans</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <CreditCard className="h-6 w-6" />
            <span>Plans</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <CreditCard className="h-6 w-6" />
            <span>Plans</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No plans found</p>
            <p className="text-sm">Your plan information will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <CreditCard className="h-6 w-6" />
              <span>Plans</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {/* Subscription Name */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Subscription Plans
              </label>
              <p className="text-base font-medium text-right">
                {transaction.plan_name} Plan
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Price
              </label>
              <p className="text-base font-medium text-right">
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            {/* Transaction Date */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Transaction Date
              </label>
              <p className="text-base font-medium text-right">
                {formatDate(transaction.created_at)}
              </p>
            </div>

            {/*Payment Method */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Payment Method
              </label>
              <p className="text-base font-medium text-right">
                {transaction.payment_method}
              </p>
            </div>

            {/* Subscription Status */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <p className="text-base font-medium text-right">
                {getStatusBadge(transaction.status)}
              </p>
            </div>
          </CardContent>

          <CardFooter>
            {transaction.checkout_url && transaction.status !== "paid" && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => window.open(transaction.checkout_url!, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue Payment
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
