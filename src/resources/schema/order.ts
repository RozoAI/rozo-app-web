import { z } from 'zod';

export const MerchantOrderSchema = z.object({
  order_id: z.string(),
  merchant_id: z.string(),
  payment_id: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DISCREPANCY']),
  callback_payload: z.object({
    type: z.string(),
    txHash: z.string(),
    chainId: z.number(),
    payment: z.object({
      id: z.string(),
      source: z.object({
        txHash: z.string(),
        chainId: z.string(),
        amountUnits: z.string(),
        tokenSymbol: z.string(),
        payerAddress: z.string(),
        tokenAddress: z.string(),
      }),
      status: z.string(),
      display: z.object({
        intent: z.string(),
        currency: z.string(),
        paymentValue: z.string(),
      }),
      metadata: z.null(),
      createdAt: z.string(),
      externalId: z.null(),
      destination: z.object({
        txHash: z.string(),
        chainId: z.string(),
        callData: z.string(),
        amountUnits: z.string(),
        tokenSymbol: z.string(),
        tokenAddress: z.string(),
        destinationAddress: z.string(),
      }),
    }),
    paymentId: z.string(),
  }),
  display_currency: z.string(),
  merchant_chain_id: z.string(),
  merchant_address: z.string(),
  required_token: z.string(),
  required_amount_usd: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  source_txn_hash: z.string(),
  source_chain_name: z.string(),
  source_token_address: z.string(),
  source_token_amount: z.number(),
  description: z.string(),
  display_amount: z.number(),
});

export type MerchantOrder = z.infer<typeof MerchantOrderSchema>;
