import { PrivyProvider, usePrivy } from './privy-client';
import { StellarProvider } from './stellar.provider';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!process.env.EXPO_PRIVY_APP_ID || !process.env.EXPO_PRIVY_WEB_CLIENT_ID) {
    throw new Error('Missing EXPO_PRIVY_APP_ID or EXPO_PRIVY_MOBILE_CLIENT_ID');
  }

  return (
    <PrivyProvider
      appId={process.env.EXPO_PRIVY_APP_ID}
      clientId={process.env.EXPO_PRIVY_WEB_CLIENT_ID}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'off',
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
