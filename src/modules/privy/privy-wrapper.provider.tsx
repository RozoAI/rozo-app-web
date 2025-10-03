import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContextProvider, type GenericWallet } from '@/contexts/auth.context';
import { setItem, showToast } from '@/lib';
import { useAuth } from '@/modules/privy/privy-client';
import { usePrivy } from '@/modules/privy/privy-client';
import { TOKEN_KEY } from '@/providers/app.provider';

export const PrivyWrapperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authenticated, ready, login, logout: privyLogout } = useAuth();
  const { getAccessToken } = usePrivy(); // Get the getAccessToken function
  const [userWallets, setUserWallets] = useState<GenericWallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<GenericWallet | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  // Handle wallet information from Privy
  const updateWalletInfo = useCallback(() => {
    if (user?.linkedAccounts) {
      const wallets: GenericWallet[] = user.linkedAccounts
        .filter((account: any) => account.type === 'wallet')
        .map((wallet: any) => ({
          address: wallet.address,
          chain: wallet.chainType || 'ethereum',
          isConnected: true,
        }));
      setUserWallets(wallets);

      // Get primary wallet (first available)
      const primaryGenericWallet = wallets.length > 0 ? wallets[0] : null;
      setPrimaryWallet(primaryGenericWallet);
    } else {
      setUserWallets([]);
      setPrimaryWallet(null);
    }
  }, [user]);

  // Update wallet info when user changes
  React.useEffect(() => {
    updateWalletInfo();
  }, [updateWalletInfo]);

  // Handle access token when user is authenticated
  const handleAccessToken = useCallback(async () => {
    if (authenticated && ready && user && !accessToken) {
      try {
        setIsAuthLoading(true);
        console.log('Getting Privy access token...');

        // Get the access token from Privy
        const token = await getAccessToken();
        console.log('Privy access token received:', token ? 'Success' : 'Failed');

        if (token) {
          // Save token to localStorage with TOKEN_KEY
          setItem(TOKEN_KEY, token);
          setAccessToken(token);
        }
      } catch (error) {
        console.error('Failed to get Privy access token:', error);
        showToast({
          type: 'danger',
          message: 'Failed to get access token',
        });
      } finally {
        setIsAuthLoading(false);
      }
    }
  }, [authenticated, ready, user, accessToken, getAccessToken]);

  // Get access token when user is authenticated
  useEffect(() => {
    handleAccessToken();
  }, [handleAccessToken]);

  const showAuthModal = useCallback(() => {
    if (authenticated) {
      privyLogout().then(() => {
        login();
      });
    } else {
      login();
    }
  }, [authenticated, privyLogout, login]);

  const logout = useCallback(async () => {
    try {
      await privyLogout();
      // Clear the access token from state and localStorage
      setAccessToken(undefined);
      setItem(TOKEN_KEY, ''); // Clear the token
    } catch (_err) {
      showToast({
        type: 'danger',
        message: 'Failed to logout',
      });
    }
  }, [privyLogout]);

  const onUserAuthenticated = useCallback(
    (token: string) => {
      // This callback can be used by the AppProvider to handle token changes
      console.log('User authenticated with token:', token);
      if (token && token !== accessToken) {
        setAccessToken(token);
        setItem(TOKEN_KEY, token);
      }
    },
    [accessToken]
  );

  // Helper function to refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        setAccessToken(token);
        setItem(TOKEN_KEY, token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return null;
    }
  }, [getAccessToken]);

  const authContextValue = useMemo(
    () => ({
      token: accessToken, // Use the actual Privy access token
      isAuthenticated: authenticated && ready && !!accessToken,
      isAuthLoading,
      user, // Include Privy user data
      wallets: userWallets,
      primaryWallet,
      showAuthModal,
      logout,
      onUserAuthenticated,
      // Additional Privy-specific functionality
      getAccessToken: refreshAccessToken,
    }),
    [
      accessToken,
      authenticated,
      ready,
      isAuthLoading,
      user,
      userWallets,
      primaryWallet,
      showAuthModal,
      logout,
      onUserAuthenticated,
      refreshAccessToken,
    ]
  );

  return <AuthContextProvider value={authContextValue}>{children}</AuthContextProvider>;
};
