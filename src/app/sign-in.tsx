import { Redirect, Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { PageLoader } from '@/components/loader/loader';
import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { Text } from '@/components/ui/text';
import { useEVMWallet } from '@/hooks/use-evm-wallet';
import { useSelectedTheme } from '@/hooks/use-selected-theme';
import { useAuth, useLogin } from '@/modules/privy/privy-client';

export default function SignInScreen() {
  const { selectedTheme } = useSelectedTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { ready, authenticated } = useAuth();
  const { hasEvmWallet, handleCreateWallet, isCreating } = useEVMWallet();
  const { login } = useLogin({
    onComplete: async () => {
      if (!hasEvmWallet) {
        await handleCreateWallet();
      }

      router.replace('/(app)/settings');
    },
  });

  if (isCreating || !ready) {
    return <PageLoader />;
  }

  if (ready && authenticated) {
    return <Redirect href="/settings" />;
  }

  return (
    <>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <FocusAwareStatusBar />

      <Box className="flex-1 items-center justify-center bg-white px-6 dark:bg-neutral-900">
        <Box className="mb-6 w-full items-center justify-center">
          {selectedTheme === 'dark' ? <LogoWhiteSvg width={100} height={100} /> : <LogoSvg width={100} height={100} />}

          <Text className="text-primary text-center text-3xl font-bold">Rozo App</Text>

          <Text className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">{t('login.description')}</Text>
        </Box>

        <Button
          size="lg"
          variant="outline"
          action="primary"
          className="w-full flex-row items-center justify-center space-x-2 rounded-xl dark:border-neutral-700"
          onPress={() => login({ loginMethods: ['email'] })}
          disabled={!ready}
        >
          {!ready ? <ButtonSpinner /> : <ButtonText>{t('login.signIn')}</ButtonText>}
        </Button>
      </Box>
    </>
  );
}
