// Client-side auth utilities untuk mengelola localStorage dan komunikasi dengan middleware
"use client";

export const AuthClient = {
  // Check if user is authenticated based on localStorage
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    const authStatus = localStorage.getItem("supabase-auth-status");
    const timestamp = localStorage.getItem("supabase-auth-timestamp");

    if (!authStatus || authStatus !== "authenticated") return false;

    // Check if auth is not too old (24 hours)
    if (timestamp) {
      const authTime = parseInt(timestamp);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - authTime > twentyFourHours) {
        // Auth is too old, clear it
        this.clearAuth();
        return false;
      }
    }

    return true;
  },

  // Set authentication status
  setAuthenticated(): void {
    if (typeof window === "undefined") return;

    localStorage.setItem("supabase-auth-status", "authenticated");
    localStorage.setItem("supabase-auth-timestamp", Date.now().toString());
    // Set cookie for middleware detection
    document.cookie = `client-auth-status=authenticated; path=/; max-age=${
      24 * 60 * 60
    }; SameSite=Lax`;
  },

  // Clear authentication status
  clearAuth(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("supabase-auth-status");
    localStorage.removeItem("supabase-auth-timestamp");

    // Set logout cookie for middleware
    document.cookie =
      "logout-in-progress=true; path=/; max-age=10; SameSite=Lax";

    // Clear auth-related cookies
    const cookiesToClear = [
      "client-auth-status",
      "sb-access-token",
      "supabase-auth-token",
      "sb-refresh-token",
      "supabase-refresh-token",
    ];

    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });

    // Clear any supabase cookies that might exist
    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName.includes("supabase") && cookieName.includes("token")) {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });
  },

  // Add auth header to requests
  addAuthHeader(headers: Headers): void {
    if (this.isAuthenticated()) {
      headers.set("x-auth-status", "authenticated");
    }
  },
};
