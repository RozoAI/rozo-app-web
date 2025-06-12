'use client';

import { DaimoPayProvider, getDefaultConfig } from '@daimo/pay';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createConfig, WagmiProvider } from 'wagmi';

export const daimoConfig = createConfig(
  getDefaultConfig({
    appName: 'RozoAI POS',
    appUrl: 'https://rozo.ai',
    appIcon: 'https://rozo.ai/rozo-logo.png',
  })
);

export const queryClient = new QueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);

  return (
    // Provide the client to your App
    <WagmiProvider config={daimoConfig}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider>{children}</DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
