import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { PageLoader } from '@/components/loader/loader';
import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { Text } from '@/components/ui/text';
import { ActionSheetLanguageSwitcher } from '@/features/settings/select-language';
import { useEVMWallet } from '@/hooks/use-evm-wallet';
import { useSelectedLanguage } from '@/hooks/use-selected-language';
import { useSelectedTheme } from '@/hooks/use-selected-theme';
import { useAuth, useLogin } from '@/modules/privy/privy-client';
import { useApp } from '@/providers/app.provider';

import { authMode } from './_layout';

/**
 * Login screen component with Dynamic authentication
 */
export default function LoginScreen() {
  const { selectedTheme } = useSelectedTheme();
  const { language, setLanguage } = useSelectedLanguage();
  const { isAuthenticated, isAuthLoading, showAuthModal } = useApp();
  const router = useRouter();
  const { t } = useTranslation();

  // Privy
  const { ready } = useAuth();

  const { hasEvmWallet, handleCreateWallet, isCreating } = useEVMWallet();
  const { login } = useLogin({
    onComplete: async () => {
      if (!hasEvmWallet) {
        await handleCreateWallet();
      }

      router.replace('/');
    },
  });

  // Redirect to home if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.navigate('/');
    }
  }, [isAuthenticated, router]);

  const handleSignIn = () => {
    if (authMode === 'dynamic') {
      showAuthModal();
    } else {
      login({ loginMethods: ['email'] });
    }
  };

  if (authMode === 'privy' && (isCreating || !ready)) {
    return <PageLoader />;
  }

  return (
    <>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <FocusAwareStatusBar />

      {/* Main content container with centered flex layout */}
      <Box className="flex-1 items-center justify-center bg-white px-6 dark:bg-neutral-900">
        {/* Logo and title section */}
        <Box className="mb-6 w-full items-center justify-center">
          {selectedTheme === 'dark' ? <LogoWhiteSvg width={100} height={100} /> : <LogoSvg width={100} height={100} />}

          <Text className="text-primary text-center text-3xl font-bold">Rozo App</Text>

          <Text className="mt-2 text-center text-base text-gray-600 dark:text-gray-300">{t('login.description')}</Text>
        </Box>

        {/* Button section */}
        <Button
          size="lg"
          variant="outline"
          action="primary"
          className="w-full flex-row items-center justify-center space-x-2 rounded-xl dark:border-neutral-700"
          onPress={handleSignIn}
          isDisabled={isAuthLoading}
        >
          {isAuthLoading && <ButtonSpinner />}
          <ButtonText>{isAuthLoading ? t('login.loading') : t('login.signIn')}</ButtonText>
        </Button>

        {/* Language selector */}
        <Box className="mt-10 w-full flex-row items-center justify-center">
          <ActionSheetLanguageSwitcher
            updateApi={false}
            initialLanguage={language ?? 'en'}
            onChange={(lang) => setLanguage(lang)}
            trigger={(label) => <Text className="mb-4 space-x-2 rounded-xl text-center text-sm">{label}</Text>}
          />
        </Box>
      </Box>
    </>
  );
}
