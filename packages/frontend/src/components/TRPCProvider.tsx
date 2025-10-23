import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, trpcClient } from "../lib/trpc";

interface TRPCProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            retry: (failureCount, error) => {
              return failureCount < 3;
            },
          },
        },
      }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div>{children}</div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
