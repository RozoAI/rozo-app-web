import { base, baseSepolia } from 'viem/chains';

import { PrivyProvider, usePrivy } from './privy-client';
import { StellarProvider } from './stellar.provider';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!process.env.EXPO_PUBLIC_PRIVY_APP_ID || !process.env.EXPO_PUBLIC_PRIVY_WEB_CLIENT_ID) {
    throw new Error('Missing EXPO_PUBLIC_PRIVY_APP_ID or EXPO_PUBLIC_PRIVY_MOBILE_CLIENT_ID');
  }

  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID}
      clientId={process.env.EXPO_PUBLIC_PRIVY_WEB_CLIENT_ID}
      config={{
        supportedChains: [base, baseSepolia],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <StellarProvider>
        {children}
        <CheckReady />
      </StellarProvider>
    </PrivyProvider>
  );
}

const CheckReady = () => {
  const privy = usePrivy();
  console.log({ privy });

  return null;
};
