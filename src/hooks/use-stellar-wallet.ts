import { type WalletWithMetadata } from '@privy-io/react-auth';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { showToast } from '@/lib';
import { useExtendedChainWallet, usePrivy, useUser } from '@/modules/privy/privy-client';
import { useStellar } from '@/modules/privy/stellar.provider';

export function useStellarWallet() {
  const { user, refreshUser } = useUser();
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();
  const { createWallet } = useExtendedChainWallet();
  const { setPublicKey, publicKey, account } = useStellar();
  const [isCreating, setIsCreating] = useState(false);

  const stellarEmbeddedWallets = useMemo<WalletWithMetadata[]>(
    () =>
      (user?.linkedAccounts.filter(
        (account) => account.type === 'wallet' && account.walletClientType === 'privy' && account.chainType === 'stellar'
      ) as WalletWithMetadata[]) ?? [],
    [user]
  );

  const handleCreateWallet = useCallback(async () => {
    setIsCreating(true);
    try {
      await createWallet({ chainType: 'stellar' });
      await refreshUser();
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setIsCreating(false);
    }
  }, [createWallet, refreshUser]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const isLoading = !ready || (authenticated && !user) || isCreating || (user && stellarEmbeddedWallets.length === 0);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // Auto-create wallet if needed
  useEffect(() => {
    if (ready && authenticated && user && stellarEmbeddedWallets.length === 0 && !isCreating) {
      // handleCreateWallet();
      showToast({ type: 'info', message: 'Create Wallet' });
    } else if (stellarEmbeddedWallets.length > 0) {
      // setPublicKey(stellarEmbeddedWallets[0]?.address);
      showToast({ type: 'success', message: `Wallet exist: ${stellarEmbeddedWallets[0]?.address}` });
    }
  }, [ready, authenticated, user, stellarEmbeddedWallets, handleCreateWallet, isCreating, setPublicKey]);

  return {
    user,
    publicKey,
    account,
    wallets: stellarEmbeddedWallets,
    isLoading,
    isCreating,
    hasStellarWallet: stellarEmbeddedWallets.length > 0 && !!stellarEmbeddedWallets[0].address,
    handleCreateWallet,
    handleLogout,
  };
}
