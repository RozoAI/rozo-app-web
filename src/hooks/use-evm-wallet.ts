import { type WalletWithMetadata } from '@privy-io/react-auth';
import { fetch } from 'expo/fetch';
import { useCallback, useMemo, useState } from 'react';

import { useCreateWallet, usePrivy, useUser } from '@/modules/privy/privy-client';

export type EVMBalanceInfo = {
  chain: string;
  asset: string;
  raw_value: string;
  raw_value_decimals: number;
  display_values: {
    usdc: string;
  };
};

export function useEVMWallet() {
  const { createWallet } = useCreateWallet();
  const { user, refreshUser } = useUser();
  const { getAccessToken } = usePrivy();

  const [isCreating, setIsCreating] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const evmEmbeddedWallets = useMemo<WalletWithMetadata[]>(
    () =>
      (user?.linkedAccounts.filter(
        (account) => account.type === 'wallet' && account.walletClientType === 'privy' && account.chainType === 'ethereum'
      ) as WalletWithMetadata[]) ?? [],
    [user]
  );

  const handleCreateWallet = useCallback(async () => {
    setIsCreating(true);
    try {
      await createWallet();
      await refreshUser();
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setIsCreating(false);
    }
  }, [createWallet, refreshUser]);

  const getBalance = useCallback(async () => {
    try {
      if (user && user.wallet && user.wallet.chainType === 'ethereum') {
        setIsBalanceLoading(true);
        const accessToken = await getAccessToken();

        const resp = await fetch(`https://api.privy.io/v1/wallets/${user.wallet.id}/balance?asset=usdc&chain=base`, {
          headers: {
            'privy-app-id': 'cmeyff6cn00ysl50b04g72k5o',
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await resp.json();
        return (data.balances || []).find((balance: EVMBalanceInfo) => balance.asset === 'usdc') as EVMBalanceInfo;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsBalanceLoading(false);
    }
  }, [user]);

  return {
    isCreating,
    isBalanceLoading,
    hasEvmWallet: evmEmbeddedWallets.length > 0 && !!evmEmbeddedWallets[0].address,
    wallets: evmEmbeddedWallets,
    handleCreateWallet,
    getBalance,
  };
}
