/**
 * Hook for handling token transfers
 *
 * This hook provides functions for transferring tokens using both standard
 * and gasless (ZeroDev) methods, with loading and error state management.
 */

import { useCallback, useMemo, useState } from 'react';
import { type Address, encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import { base } from 'viem/chains';

import { authMode } from '@/app/_layout';
import { useDynamic } from '@/modules/dynamic/dynamic-client';
import { type TokenTransferResult, transferToken, transferTokenZeroDev } from '@/modules/dynamic/token-operations';
import { useSendTransaction, useWallets } from '@/modules/privy/privy-client';
import { useApp } from '@/providers/app.provider';

type TransferStatus = {
  isLoading: boolean;
  error: string | null;
  transactionHash: string | null;
  signature: string | null;
  success: boolean;
};

type TransferOptions = {
  toAddress: Address;
  amount: string;
  useGasless?: boolean;
  customMessage?: string;
};

type UseTokenTransferResult = {
  isAbleToTransfer: boolean;
  transfer: (options: TransferOptions) => Promise<TokenTransferResult>;
  status: TransferStatus;
  resetStatus: () => void;
};

/**
 * Hook to handle token transfers with loading and error states
 *
 * @returns Object containing transfer function, transfer status, and reset function
 *
 * @example
 * const { transfer, status, resetStatus } = useTokenTransfer();
 *
 * // Transfer tokens in a component
 * const handleTransfer = async () => {
 *   const result = await transfer({
 *     toAddress: '0x1234...5678',
 *     amount: '10.5',
 *     useGasless: true, // Optional: use gasless transactions
 *     customMessage: 'Payment for order #12345' // Optional: custom message to sign
 *   });
 *
 *   if (result.success) {
 *     console.log('Transfer successful!');
 *     if (result.signature) {
 *       console.log('Message signed with signature:', result.signature);
 *     }
 *   }
 * };
 *
 * // Display status in component
 * return (
 *   <View>
 *     {status.isLoading && <ActivityIndicator />}
 *     {status.error && <Text className="text-red-500">{status.error}</Text>}
 *     {status.success && (
 *       <Text className="text-green-500">
 *         Transfer successful! Tx: {status.transactionHash}
 *         {status.signature && <Text>\nSigned with: {status.signature}</Text>}
 *       </Text>
 *     )}
 *     <Button onPress={handleTransfer} disabled={status.isLoading}>
 *       Transfer Tokens
 *     </Button>
 *   </View>
 * );
 */
export function useTokenTransfer(): UseTokenTransferResult {
  const { merchantToken } = useApp();
  const { wallets } = useDynamic();
  const walletsPrivy = useWallets();

  const [status, setStatus] = useState<TransferStatus>({
    isLoading: false,
    error: null,
    transactionHash: null,
    signature: null,
    success: false,
  });

  /**
   * Reset the transfer status
   */
  const resetStatus = useCallback(() => {
    setStatus({
      isLoading: false,
      error: null,
      transactionHash: null,
      signature: null,
      success: false,
    });
  }, []);

  const { sendTransaction } = useSendTransaction();

  /**
   * Transfer tokens to an address
   *
   * @param toAddress - Recipient address
   * @param amount - Amount to transfer as a string
   * @param useGasless - Whether to use gasless transactions via ZeroDev
   * @returns Result of the transfer operation
   */
  const transfer = useCallback(
    async (options: TransferOptions): Promise<TokenTransferResult> => {
      const { toAddress, amount, useGasless = false } = options;

      setStatus({
        isLoading: true,
        error: null,
        transactionHash: null,
        signature: null,
        success: false,
      });

      try {
        if (authMode === 'dynamic') {
          if (!wallets.primary || !merchantToken) {
            const error = new Error('Wallet or token not available');
            setStatus({
              isLoading: false,
              error: error.message,
              transactionHash: null,
              signature: null,
              success: false,
            });
            return { success: false, error };
          }

          // Use either standard or gasless transfer based on parameter
          const result = useGasless
            ? await transferTokenZeroDev({
                fromWallet: wallets.primary,
                toAddress,
                amount,
                token: merchantToken,
              })
            : await transferToken(wallets.primary, toAddress, amount, merchantToken);

          setStatus({
            isLoading: false,
            error: null,
            transactionHash: result.transactionHash || null,
            signature: result.signature || null,
            success: result.success,
          });

          return result;
        } else {
          if (!walletsPrivy.wallets[0] || !merchantToken) {
            const error = new Error('Wallet or token not available');
            setStatus({
              isLoading: false,
              error: error.message,
              transactionHash: null,
              signature: null,
              success: false,
            });
            return { success: false, error };
          }

          const wallet = walletsPrivy.wallets[0];
          wallet.switchChain(base.id);

          const encodedData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [toAddress, parseUnits(amount, merchantToken.decimal)],
          });

          const baseUsdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
          const signature = await sendTransaction({
            to: baseUsdc,
            data: encodedData,
            chainId: merchantToken.network.chain.id,
          });

          return {
            success: true,
            error: undefined,
            signature: encodedData,
            transactionHash: signature.hash,
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to transfer tokens';
        setStatus({
          isLoading: false,
          error: errorMessage,
          transactionHash: null,
          signature: null,
          success: false,
        });
        return {
          success: false,
          error: err instanceof Error ? err : new Error(errorMessage),
        };
      }
    },
    [wallets.primary, merchantToken, walletsPrivy.wallets]
  );

  const isAbleToTransfer = useMemo(() => {
    return authMode === 'dynamic'
      ? !!(wallets.primary && merchantToken)
      : !!(walletsPrivy && (walletsPrivy.wallets || []).length > 0 && merchantToken);
  }, [wallets.primary, merchantToken, walletsPrivy]);

  return {
    isAbleToTransfer,
    transfer,
    status,
    resetStatus,
  };
}
