/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';

import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { Text } from '@/components/ui/text';
import { useSelectedTheme } from '@/hooks';
import { showToast } from '@/lib';
import { useDynamic } from '@/modules/dynamic/dynamic-client';
import { useApp } from '@/providers/app.provider';
import { useCreateProfile } from '@/resources/api';

/**
 * Login screen component with Google authentication
 */
export default function LoginScreen() {
  const { selectedTheme } = useSelectedTheme();
  const { isAuthenticated, setToken } = useApp();
  const { ui, auth, wallets } = useDynamic();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { mutate: createProfile, isError, error, isSuccess, isPending } = useCreateProfile();

  const onLoginSuccess = () => {
    setToken(auth.token!);
    showToast({
      type: 'success',
      message: 'Welcome to Rozo POS',
    });

    router.navigate('/');
  };

  auth.on('authInit', () => {
    setIsLoading(true);
  });

  auth.on('authSuccess', (user: any) => {
    setIsLoading(true);

    if (user) {
      // TODO: Remove the hardcode if the API is fixed
      const evmWallet = wallets.userWallets.find((wallet: any) => wallet.chain === 'EVM');
      createProfile({
        email: user?.email ?? '',
        display_name: user?.email ?? '',
        description: '',
        logo_url: '',
        default_currency: 'USD', // Default currency
        default_language: 'EN', // Default language
        // TODO: Remove the hardcode if the API is fixed
        default_token_id: 'USDC_BASE',
        wallet_address: evmWallet?.address ?? '',
      });
    } else {
      showToast({
        type: 'danger',
        message: 'Failed to login',
      });
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (isSuccess) {
      onLoginSuccess();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      showToast({
        type: 'danger',
        message: error?.message ?? 'Failed to create profile',
      });
      setIsLoading(false);
    }
  }, [isError]);

  // redirect to home if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.navigate('/');
    }
  }, [isAuthenticated]);

  return (
    <Box className="flex-1 bg-white">
      <FocusAwareStatusBar />

      {/* Main content container with centered flex layout */}
      <Box className="flex-1 items-center justify-center px-6">
        {/* Logo and title section */}
        <Box className="mb-6 w-full items-center justify-center">
          {selectedTheme === 'dark' ? <LogoWhiteSvg width={120} height={120} /> : <LogoSvg width={120} height={120} />}

          <Text className="text-center text-3xl font-bold text-primary-600">Rozo POS</Text>

          <Text className="mt-2 text-center text-base text-gray-600">Simple and efficient point of sale system</Text>
        </Box>

        {/* Button section */}
        <Button
          size="lg"
          variant="outline"
          action="primary"
          className="w-full flex-row items-center justify-center space-x-2 rounded-xl"
          onPress={() => ui.auth.show()}
          isDisabled={isLoading || isPending}
        >
          {(isLoading || isPending) && <ButtonSpinner />}
          <ButtonText>{isLoading || isPending ? 'Loading...' : 'Sign in'}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
