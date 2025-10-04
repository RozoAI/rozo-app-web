import { useCallback, useEffect, useMemo, useState } from 'react';

import { type TokenBalanceResult } from '@/lib/tokens';
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

  const { getBalance, usdcBalance } = useEVMWallet();

  const fetchBalance = useCallback(async () => {
    if (!primaryWallet || !merchantToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (primaryWallet && merchantToken) {
        await getBalance();
        if (usdcBalance) {
          setBalance({
            balance: usdcBalance.display_values.usdc ?? '0',
            formattedBalance: usdcBalance.display_values.usdc ?? '0',
            token: merchantToken,
            balanceRaw: BigInt(usdcBalance.raw_value),
          });
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
