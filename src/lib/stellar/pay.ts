import { Asset, Memo, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

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
};

export const StellarPayNow = async ({
  account,
  publicKey,
  token,
  order,
  server,
}: {
  account: StellarAccount;
  publicKey: string;
  token: {
    key: string;
    address: string;
  };
  order: {
    address: string;
    pay_amount: number;
    salt?: string;
  };
  server: StellarServer;
}): Promise<string> => {
  try {
    if (account && publicKey) {
      const amount = order?.pay_amount ?? 0;
      const memo = String(order?.salt ?? '');

      const asset =
        !token?.key || token?.key === 'XLM' ? Asset.native() : new Asset(token?.key.replace('_XLM', ''), token?.address);

      const sourceAccount = await server.loadAccount(publicKey);
      if (!sourceAccount) {
        throw new Error('Source account not found');
      }

      const baseFee = await server.fetchBaseFee();

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: String(baseFee),
        networkPassphrase: Networks.PUBLIC,
      })
        .addOperation(
          Operation.payment({
            destination: order?.address ?? '',
            asset: asset,
            amount: String(amount),
          })
        )
        .addMemo(Memo.text(memo))
        .setTimeout(180)
        .build();

      return transaction.toXDR();
    } else {
      throw new Error('Account not found');
    }
  } catch (error) {
    throw error;
  }
};
