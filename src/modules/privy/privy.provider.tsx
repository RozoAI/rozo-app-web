import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { base } from 'viem/chains';

import { StellarProvider } from './stellar.provider';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!process.env.EXPO_PUBLIC_PRIVY_APP_ID || !process.env.EXPO_PUBLIC_PRIVY_MOBILE_CLIENT_ID) {
    throw new Error('Missing EXPO_PUBLIC_PRIVY_APP_ID or EXPO_PUBLIC_PRIVY_MOBILE_CLIENT_ID');
  }

  return (
    <PrivyProvider
      appId={'cmeyff6cn00ysl50b04g72k5o'}
      clientId={'client-WY6PsmwzvcGusMZSKi8hBDr9Q5Bt3hs72PQub4BdGquDz'}
      supportedChains={[base]}
      config={{
        embedded: {
          ethereum: {
            createOnLogin: 'off',
          },
        },
      }}
    >
      <StellarProvider>
        {children}
        <PrivyElements />
      </StellarProvider>
    </PrivyProvider>
  );
}
