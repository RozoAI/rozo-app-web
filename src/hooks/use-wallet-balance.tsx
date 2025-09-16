import { useCallback, useEffect, useMemo, useState } from 'react';

import { authMode } from '@/app/_layout';
import { getTokenBalance, type TokenBalanceResult } from '@/modules/dynamic/token-operations';
import { useApp } from '@/providers/app.provider';

import { useEVMWallet } from './use-evm-wallet';

type UseWalletBalanceResult = {
  balance: TokenBalanceResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useWalletBalance(): UseWalletBalanceResult {
  const { primaryWallet, merchantToken } = useApp();

  const [balance, setBalance] = useState<TokenBalanceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { getBalance } = useEVMWallet();

  const fetchBalance = useCallback(async () => {
    if (!primaryWallet || !merchantToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (primaryWallet && merchantToken) {
        if (authMode === 'dynamic') {
          // @ts-ignore
          const balance = await getTokenBalance(primaryWallet, merchantToken);
          setBalance(balance);
        } else {
          const balance = await getBalance();
          if (balance) {
            setBalance({
              balance: balance.display_values.usdc,
              formattedBalance: balance.display_values.usdc,
              token: merchantToken,
              balanceRaw: BigInt(balance.raw_value),
            });
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, merchantToken]);

  // Fetch balance on component mount and when dependencies change
  useEffect(() => {
    if (primaryWallet || merchantToken) {
      fetchBalance();
    }
  }, []);

  return useMemo(
    () => ({
      balance,
      isLoading,
      error,
      refetch: fetchBalance,
    }),
    [balance, isLoading, error]
  );
}
