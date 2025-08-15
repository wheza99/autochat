// Halaman callback untuk menangani proses autentikasi OAuth
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error during auth callback:", error);
        router.push("/login?error=auth_callback_error");
        return;
      }

      if (data.session) {
        // Set localStorage flag for client-side detection
        localStorage.setItem("supabase-auth-status", "authenticated");
        localStorage.setItem("supabase-auth-timestamp", Date.now().toString());

        // Set cookie for middleware detection
        document.cookie = `client-auth-status=authenticated; path=/; max-age=${
          24 * 60 * 60
        }; SameSite=Lax`;

        // Redirect to dashboard after successful login
        // Add small delay to ensure session is properly established and cookies are set
        setTimeout(() => {
          router.push("/dashboard");
        }, 200);
      } else {
        // No session found, redirect back to login
        localStorage.removeItem("supabase-auth-status");
        localStorage.removeItem("supabase-auth-timestamp");
        // Clear auth cookie
        document.cookie =
          "client-auth-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing login...</p>
      </div>
    </div>
  );
}
