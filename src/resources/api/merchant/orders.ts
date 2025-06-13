import { type AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '@/modules/axios/client';
import { type MerchantOrder } from '@/resources/schema/order';

export const useOrdersQuery = (offset: number, limit: number) =>
  createQuery<Response, {}, AxiosError>({
    queryKey: ['orders', offset, limit],
    fetcher: () => {
      return client
        .get('functions/v1/orders', {
          params: {
            limit,
            offset,
          },
        })
        .then((res) => res.data);
    },
  });

// Updated mock data based on new schema
export const mockOrders: MerchantOrder[] = [
  {
    order_id: '858be7b0-4d8e-4637-9785-50ad46a72806',
    merchant_id: '244ff2e5-5cfc-403e-8d76-3cc92ad832e6',
    payment_id: 'FyDKm6stuA4By6QATHZiKG7JcpS6C8N6UDw5X9BrV5gY',
    status: 'COMPLETED',
    callback_payload: {
      type: 'payment_completed',
      txHash: '0x8da1cb927a5048badba2969730bccdb99ab1d4453b51826b9592dbfad4ab1f93',
      chainId: 8453,
      payment: {
        id: 'FyDKm6stuA4By6QATHZiKG7JcpS6C8N6UDw5X9BrV5gY',
        source: {
          txHash: '0x75c864a53fcc7de1c37fc85c592c7c7750b5f00b6766b951ccdda92604429290',
          chainId: '42161',
          amountUnits: '0.1',
          tokenSymbol: 'USDT',
          payerAddress: '0x8743AF5bAA18731E962c08707352b45164e069F9',
          tokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        },
        status: 'payment_completed',
        display: {
          intent: 'Rozo',
          currency: 'USD',
          paymentValue: '0.10',
        },
        metadata: null,
        createdAt: '1749733610',
        externalId: null,
        destination: {
          txHash: '0x8da1cb927a5048badba2969730bccdb99ab1d4453b51826b9592dbfad4ab1f93',
          chainId: '8453',
          callData: '0x',
          amountUnits: '0.1',
          tokenSymbol: 'USDC',
          tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          destinationAddress: '0x67D3812A469550F9daE43857ced80Ed7684963f0',
        },
      },
      paymentId: 'FyDKm6stuA4By6QATHZiKG7JcpS6C8N6UDw5X9BrV5gY',
    },
    display_currency: 'USD',
    merchant_chain_id: '8453',
    merchant_address: '0x67D3812A469550F9daE43857ced80Ed7684963f0',
    required_token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    required_amount_usd: 0.1,
    created_at: '2025-06-12T13:06:50.203+00:00',
    updated_at: '2025-06-12T13:07:28.421+00:00',
    source_txn_hash: '0x75c864a53fcc7de1c37fc85c592c7c7750b5f00b6766b951ccdda92604429290',
    source_chain_name: '42161',
    source_token_address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    source_token_amount: 0.1,
    description:
      'Curatio vallum caste surgo. Tandem admiratio aperte tracto arcesso. Truculenter sublime infit cubitum cogito voveo ait atrox uterque. Degenero cupio arceo crepusculum ventito cunae autem arx. Conqueror agnitio demo comburo verumtamen tertius amita. Tametsi aiunt tepidus sono ver nemo.',
    display_amount: 0.1,
  },
];
