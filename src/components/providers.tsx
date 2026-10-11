"use client";

import { StoreProvider, useStore } from "@/lib/store/store";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToasterHost } from "@/components/ui/overlay";

function StoreToaster() {
  const { toasts, dismissToast } = useStore();
  return <ToasterHost toasts={toasts} onDismiss={dismissToast} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        {children}
        <StoreToaster />
      </StoreProvider>
    </ThemeProvider>
  );
}
