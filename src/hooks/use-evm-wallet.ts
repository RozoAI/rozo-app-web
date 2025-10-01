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
    usdc?: string;
    eth?: string;
  };
};

export function useEVMWallet() {
  const { createWallet } = useCreateWallet();
  const { user, refreshUser } = useUser();
  const { getAccessToken } = usePrivy();

  const [isCreating, setIsCreating] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balances, setBalances] = useState<EVMBalanceInfo[]>([]);

  const evmEmbeddedWallets = useMemo<WalletWithMetadata[]>(
    () =>
      (user?.linkedAccounts.filter(
        (account) => account.type === 'wallet' && account.walletClientType === 'privy' && account.chainType === 'ethereum'
      ) as WalletWithMetadata[]) ?? [],
    [user]
  );

  const handleCreateWallet = useCallback(async () => {
    // Only create wallet if user doesn't have an embedded wallet
    if (evmEmbeddedWallets.length > 0) {
      return;
    }

    setIsCreating(true);
    try {
      await createWallet();
      await refreshUser();
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setIsCreating(false);
    }
  }, [createWallet, refreshUser, evmEmbeddedWallets.length]);

  const getBalance = useCallback(async (): Promise<EVMBalanceInfo[] | undefined> => {
    setIsBalanceLoading(true);
    try {
      if (user?.wallet?.chainType === 'ethereum') {
        const accessToken = await getAccessToken();

        // Fetch ETH balance
        const ethResp = await fetch(`https://api.privy.io/v1/wallets/${user.wallet.id}/balance?asset=eth&chain=base`, {
          headers: {
            'privy-app-id': 'cmeyff6cn00ysl50b04g72k5o',
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch USDC balance
        const usdcResp = await fetch(`https://api.privy.io/v1/wallets/${user.wallet.id}/balance?asset=usdc&chain=base`, {
          headers: {
            'privy-app-id': 'cmeyff6cn00ysl50b04g72k5o',
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const ethData = await ethResp.json();
        const usdcData = await usdcResp.json();

        console.log('ETH data:', ethData);
        console.log('USDC data:', usdcData);

        const allBalances = [...(ethData.balances || []), ...(usdcData.balances || [])];

        setBalances(allBalances);
        return allBalances;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsBalanceLoading(false);
    }
  }, [user]);

  const ethBalance = useMemo(() => {
    return balances.find((balance) => balance.asset === 'eth') as EVMBalanceInfo | undefined;
  }, [balances]);

  const usdcBalance = useMemo(() => {
    return balances.find((balance) => balance.asset === 'usdc') as EVMBalanceInfo | undefined;
  }, [balances]);

  return {
    isCreating,
    isBalanceLoading,
    hasEvmWallet: evmEmbeddedWallets.length > 0 && !!evmEmbeddedWallets[0].address,
    wallets: evmEmbeddedWallets,
    handleCreateWallet,
    getBalance,
    balances,
    ethBalance,
    usdcBalance,
  };
}
