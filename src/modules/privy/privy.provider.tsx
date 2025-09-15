import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';

import { StellarProvider } from './stellar.provider';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!process.env.EXPO_PUBLIC_PRIVY_APP_ID || !process.env.EXPO_PUBLIC_PRIVY_MOBILE_CLIENT_ID) {
    throw new Error('Missing EXPO_PUBLIC_PRIVY_APP_ID or EXPO_PUBLIC_PRIVY_MOBILE_CLIENT_ID');
  }

  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID}
      clientId={process.env.EXPO_PUBLIC_PRIVY_MOBILE_CLIENT_ID}
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
