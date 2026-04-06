import { useState } from "react";
import { useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SetupInitializer } from "@craft-apex/auth";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SetupInitializerWrapper>{children}</SetupInitializerWrapper>
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

/**
 * Separate component so useLocation() is called inside QueryClientProvider.
 */
function SetupInitializerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();

  return (
    <SetupInitializer routeKey={pathname}>{children}</SetupInitializer>
  );
}
