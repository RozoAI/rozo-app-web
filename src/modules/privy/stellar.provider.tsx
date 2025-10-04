import { Asset, BASE_FEE, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import axios from 'axios';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { StellarConfig } from '@/lib/stellar/config';

type StellarContextProvider = { children: ReactNode; stellarRpcUrl?: string };

// Custom types to avoid Horizon.Server dependency
type StellarAccount = {
  account_id: string;
  balances: {
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
    balance: string;
  }[];
  sequence: string;
  // Add required properties for Stellar SDK Account interface
  accountId: () => string;
  sequenceNumber: () => string;
  incrementSequenceNumber: () => void;
};

type StellarServer = {
  loadAccount: (publicKey: string) => Promise<StellarAccount>;
  fetchBaseFee: () => Promise<number>;
  strictSendPaths: (
    sourceAsset: Asset,
    sourceAmount: string,
    destinationAssets: Asset[]
  ) => {
    call: () => Promise<{
      records: {
        destination_amount: string;
      }[];
    }>;
  };
};

type StellarContextProviderValue = {
  server: StellarServer | undefined;
  publicKey: string | undefined;
  setPublicKey: (publicKey: string) => void;
  account: StellarAccount | undefined;
  isConnected: boolean;
  disconnect: () => void;
  convertXlmToUsdc: (amount: string) => Promise<string>;
  enableUsdcTrustline: () => Promise<string>;
  refreshAccount: () => Promise<void>;
};

const initialContext = {
  server: undefined,
  publicKey: undefined,
  setPublicKey: () => {},
  account: undefined,
  isConnected: false,
  disconnect: () => {},
  convertXlmToUsdc: () => Promise.resolve(''),
  enableUsdcTrustline: () => Promise.resolve(''),
  refreshAccount: () => Promise.resolve(),
};

export const StellarContext = createContext<StellarContextProviderValue>(initialContext);

// Custom Stellar server implementation using axios
class CustomStellarServer implements StellarServer {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async loadAccount(publicKey: string): Promise<StellarAccount> {
    const response = await axios.get(`${this.baseURL}/accounts/${publicKey}`);
    const data = response.data;

    // Transform the response to match our StellarAccount interface
    return {
      ...data,
      accountId: () => data.account_id,
      sequenceNumber: () => data.sequence,
      incrementSequenceNumber: () => {
        // Mock implementation - in real usage, this would increment the sequence
        data.sequence = (parseInt(data.sequence) + 1).toString();
      },
    };
  }

  async fetchBaseFee(): Promise<number> {
    const response = await axios.get(`${this.baseURL}/fee_stats`);
    return parseInt(response.data.last_ledger_base_fee) || 100;
  }

  strictSendPaths(sourceAsset: Asset, sourceAmount: string, destinationAssets: Asset[]) {
    return {
      call: async () => {
        const sourceAssetParam = sourceAsset.isNative() ? 'native' : `${sourceAsset.code}:${sourceAsset.issuer}`;

        const destinationAssetsParam = destinationAssets
          .map((asset) => (asset.isNative() ? 'native' : `${asset.code}:${asset.issuer}`))
          .join(',');

        const response = await axios.get(`${this.baseURL}/paths/strict-send`, {
          params: {
            source_asset_type: sourceAsset.isNative() ? 'native' : 'credit_alphanum4',
            source_asset_code: sourceAsset.isNative() ? undefined : sourceAsset.code,
            source_asset_issuer: sourceAsset.isNative() ? undefined : sourceAsset.issuer,
            source_amount: sourceAmount,
            destination_assets: destinationAssetsParam,
          },
        });

        return {
          records: response.data._embedded.records || [],
        };
      },
    };
  }
}

export const StellarProvider = ({ children, stellarRpcUrl }: StellarContextProvider) => {
  const [publicKey, setPublicKey] = useState<string | undefined>(undefined);
  const [accountInfo, setAccountInfo] = useState<StellarAccount | undefined>(undefined);

  const server = new CustomStellarServer(stellarRpcUrl ?? StellarConfig.NETWORK.rpcUrl);

  const getAccountInfo = async (publicKey: string) => {
    try {
      const data = await server.loadAccount(publicKey);

      setAccountInfo(data);
    } catch (error: any) {
      console.error(error);
    }
  };

  const convertXlmToUsdc = async (amount: string) => {
    try {
      const destAsset = StellarConfig.USDC_ASSET.asset;
      const pathResults = await server.strictSendPaths(Asset.native(), amount, [destAsset]).call();

      if (!pathResults?.records?.length) {
        throw new Error('No exchange rate found for XLM swap');
      }

      // Apply 5% slippage tolerance
      const bestPath = pathResults.records[0];
      const estimatedDestMinAmount = (parseFloat(bestPath.destination_amount) * 0.94).toFixed(2);

      return estimatedDestMinAmount;
    } catch (error: any) {
      throw error;
    }
  };

  const enableUsdcTrustline = async (): Promise<string> => {
    if (!publicKey) {
      throw new Error('No account connected');
    }

    try {
      // Refresh account info to get latest sequence number
      const freshAccount = await server.loadAccount(publicKey);

      // Create changeTrust operation for USDC
      const changeTrustOp = Operation.changeTrust({
        asset: new Asset(StellarConfig.USDC_ASSET.code, StellarConfig.USDC_ASSET.issuer),
        limit: '922337203685.4775807', // Maximum limit
      });

      // Build transaction with fresh account data
      const transaction = new TransactionBuilder(freshAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
      })
        .addOperation(changeTrustOp)
        .setTimeout(30)
        .build();

      // Return the transaction XDR for signing
      return transaction.toXDR();
    } catch (error: any) {
      console.error('Error creating trustline transaction:', error);
      throw error;
    }
  };

  const refreshAccount = async () => {
    if (publicKey) {
      await getAccountInfo(publicKey);
    }
  };

  const disconnect = async () => {
    try {
      setPublicKey(undefined);
      setAccountInfo(undefined);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      refreshAccount();
    }
  }, [publicKey]);

  return (
    <StellarContext.Provider
      value={{
        publicKey,
        setPublicKey,
        server,
        account: accountInfo,
        isConnected: !!publicKey,
        disconnect,
        convertXlmToUsdc,
        enableUsdcTrustline,
        refreshAccount,
      }}
    >
      {children}
    </StellarContext.Provider>
  );
};

export const useStellar = () => useContext(StellarContext);
