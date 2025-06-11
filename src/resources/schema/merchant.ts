import { z } from 'zod';

export const MerchantProfileSchema = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  default_currency: z.string(),
  default_language: z.string(),
  default_token_id: z.string(),
  description: z.string().nullable(),
  display_name: z.string(),
  dynamic_id: z.string().uuid(),
  email: z.string().email(),
  logo_url: z.string().url().nullable(),
  merchant_id: z.string().uuid(),
  wallet_address: z.string(),
});

export type MerchantProfile = z.infer<typeof MerchantProfileSchema>;
