"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/**
 * Initializes Supabase connection + realtime subscriptions on mount.
 * Wraps the app to ensure store is hydrated before rendering.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initialize = useStore((s) => s.initialize);
  const cleanup = useStore((s) => s.cleanup);

  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  return <>{children}</>;
}
