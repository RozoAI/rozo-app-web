import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '@/modules/axios/client';
import { type MerchantProfile } from '@/resources/schema/merchant';

type Payload = {
  email: string;
  display_name: string;
  description?: string | null;
  logo_url?: string | null;
  default_currency: string;
  default_language: string;
  default_token_id?: string;
  wallet_address?: string;
};
type Response = MerchantProfile;

export const useCreateProfile = createMutation<Response, Payload, AxiosError>({
  mutationFn: async (payload) =>
    client({
      url: 'functions/v1/merchants',
      method: 'POST',
      data: payload,
    }).then((response) => response.data.profile),
});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const useGetProfile = createQuery<Response, {}, AxiosError>({
  queryKey: ['profile'],
  fetcher: () => {
    return client.get('functions/v1/merchants').then((response) => response.data.profile);
  },
  enabled: false,
});
