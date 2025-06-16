/**
 * Hook for fetching and managing wallet token balance
 *
 * This hook handles fetching the token balance for a wallet address,
 * including loading states, error handling, and refetching.
 */

import { useCallback, useEffect, useState } from 'react';
import { type Address } from 'viem';

import { useDynamic } from '@/modules/dynamic/dynamic-client';
import { getTokenBalance } from '@/modules/dynamic/token-operations';
import { useApp } from '@/providers/app.provider';

type UseWalletBalanceResult = {
  balance: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Hook to fetch and manage wallet token balance
 *
 * @param walletAddress - The wallet address to check balance for
 * @returns Object containing balance, loading state, error state, and refetch function
 *
 * @example
 * const { balance, isLoading, error, refetch } = useWalletBalance(walletAddress);
 *
 * // Display balance in component
 * return (
 *   <View>
 *     {isLoading ? (
 *       <ActivityIndicator />
 *     ) : error ? (
 *       <Text className="text-red-500">{error}</Text>
 *     ) : (
 *       <Text>{balance} USDC</Text>
 *     )}
 *     <Button onPress={refetch}>Refresh</Button>
 *   </View>
 * );
 */
export function useWalletBalance(walletAddress?: Address): UseWalletBalanceResult {
  const { merchantToken } = useApp();
  const { wallets } = useDynamic();

  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Find the wallet object by address
  const wallet = walletAddress
    ? wallets.userWallets?.find((w) => w.address.toLowerCase() === walletAddress.toLowerCase())
    : undefined;

  /**
   * Fetch token balance from the blockchain
   */
  const fetchBalance = useCallback(async () => {
    if (!wallet || !merchantToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getTokenBalance(wallet, merchantToken);
      if (result) {
        setBalance(result.formattedBalance);
      } else {
        setError('Could not fetch balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [wallet, merchantToken]);

  // Fetch balance on component mount and when dependencies change
  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
