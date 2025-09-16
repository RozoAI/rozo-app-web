import { type BaseWallet } from '@dynamic-labs/types';
import React, { useCallback, useMemo, useState } from 'react';

import { AuthContextProvider, type GenericWallet } from '@/contexts/auth.context';
import { showToast } from '@/lib';
import { dynamicClient } from '@/modules/dynamic/dynamic-client';
import { useDynamic } from '@/modules/dynamic/dynamic-client';

interface IDynamicWrapperProps {
  children: React.ReactNode;
  onTokenChange?: (token: string | undefined) => void;
  onAuthLoadingChange?: (loading: boolean) => void;
  onWalletChange?: (wallets: GenericWallet[], primary: GenericWallet | null) => void;
}

export const DynamicWrapperProvider: React.FC<IDynamicWrapperProps> = ({
  children,
  onTokenChange,
  onAuthLoadingChange,
  onWalletChange,
}) => {
  const { auth, wallets, ui } = useDynamic();
  const [userWallets, setUserWallets] = useState<GenericWallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<GenericWallet | null>(null);
  const [isAuthLoading, _setIsAuthLoading] = useState(false);

  // Convert Dynamic wallets to generic format
  const updateWalletInfo = useCallback(() => {
    if (wallets?.userWallets) {
      const genericWallets: GenericWallet[] = wallets.userWallets.map((wallet: BaseWallet) => ({
        address: wallet.address,
        chain: wallet.chain,
        isConnected: wallet.isAuthenticated ?? true,
      }));
      setUserWallets(genericWallets);

      const primaryGenericWallet: GenericWallet | null = wallets.primary
        ? {
            address: wallets.primary.address,
            chain: wallets.primary.chain,
            isConnected: wallets.primary.isAuthenticated ?? true,
          }
        : null;
      setPrimaryWallet(primaryGenericWallet);

      // Notify parent about wallet changes
      onWalletChange?.(genericWallets, primaryGenericWallet);
    }
  }, [wallets, onWalletChange]);

  // Update wallet info when wallets change
  React.useEffect(() => {
    updateWalletInfo();
  }, [updateWalletInfo]);

  // Notify parent about auth loading changes
  React.useEffect(() => {
    onAuthLoadingChange?.(isAuthLoading);
  }, [isAuthLoading, onAuthLoadingChange]);

  // Notify parent about token changes
  React.useEffect(() => {
    if (auth.token) {
      onTokenChange?.(auth.token);
    }
  }, [auth.token, onTokenChange]);

  const showAuthModal = useCallback(() => {
    if (auth.token) {
      auth.logout().then(() => {
        ui.auth.show();
      });
    } else {
      ui.auth.show();
    }
  }, [auth, ui]);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (_err) {
      showToast({
        type: 'danger',
        message: 'Failed to logout',
      });
    }
  }, [auth]);

  const onUserAuthenticated = useCallback((token: string) => {
    // This will be called by auth event handlers
    console.log('User authenticated with token:', token);
  }, []);

  const authContextValue = useMemo(
    () => ({
      token: auth.token,
      isAuthenticated: !!auth.token,
      isAuthLoading,
      user: undefined, // Dynamic doesn't expose user data in the same way
      wallets: userWallets,
      primaryWallet,
      showAuthModal,
      logout,
      onUserAuthenticated,
    }),
    [auth.token, isAuthLoading, userWallets, primaryWallet, showAuthModal, logout, onUserAuthenticated]
  );

  return (
    <AuthContextProvider value={authContextValue as any}>
      {/* @ts-ignore */}
      <dynamicClient.reactNative.WebView />
      {children}
    </AuthContextProvider>
  );
};
