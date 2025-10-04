import { type PrivyEmbeddedWalletAccount, type PrivyUser, usePrivy, usePrivyClient } from '@privy-io/expo';
import { useCreateWallet } from '@privy-io/expo/extended-chains';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { showToast } from '@/lib';
import { useStellar } from '@/modules/privy/stellar.provider';

export function useStellarWallet() {
  const router = useRouter();
  const { user: privyUser, isReady: ready, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { setPublicKey, publicKey, account } = useStellar();
  const client = usePrivyClient();

  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<PrivyUser | null>(privyUser);

  const stellarEmbeddedWallets = useMemo<PrivyEmbeddedWalletAccount[]>(
    () =>
      (user?.linked_accounts.filter(
        (account) => account.type === 'wallet' && account.wallet_client_type === 'privy' && account.chain_type === 'stellar'
      ) as PrivyEmbeddedWalletAccount[]) ?? [],
    [user]
  );

  const authenticated = useMemo(() => {
    return user && ready && !!user.id;
  }, [user, ready]);

  const refreshUser = useCallback(async () => {
    const fetchedUser = await client.user.get();
    if (fetchedUser) {
      setUser(fetchedUser.user);
    }
  }, [client]);

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

  /**
   * Auto-create wallet if needed
   * @TODO: ENABLE THIS WHEN WE ENABLE STELLAR WALLET CREATION
   */
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
