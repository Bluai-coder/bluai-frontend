// ============================================================
// app/providers.tsx — Client-side providers
// ============================================================
'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            const status = error?.response?.status;
            if (status !== 401 && status !== 429) {
              toast.error(error?.response?.data?.message || error?.message || 'Something went wrong');
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            const status = error?.response?.status;
            if (status !== 401 && status !== 429) {
              toast.error(error?.response?.data?.message || error?.message || 'Operation failed');
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error?.response?.status === 429 || error?.response?.status === 401) return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
