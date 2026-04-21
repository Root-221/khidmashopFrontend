"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { loadUserProfile } from "@/services/auth.service";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated || !token) return;

    loadUserProfile().catch(() => {
      useAuthStore.getState().setUser(null);
    });
  }, [isHydrated, token]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" reverseOrder={false} gutter={12} />
    </QueryClientProvider>
  );
}
