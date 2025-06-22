import { type AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '@/modules/axios/client';
import { type MerchantOrder } from '@/resources/schema/order';

type Payload = {
  display_amount: number;
  display_currency: string;
  description?: string;
};

export const useGetOrders = createQuery<MerchantOrder[], { status: string }, AxiosError>({
  queryKey: ['orders'],
  fetcher: ({ status }) =>
    client
      .get('functions/v1/orders', {
        params: { status },
      })
      .then((res) => res?.data?.orders ?? []),
});

export const useGetOrder = createQuery<MerchantOrder, { id: string }, AxiosError>({
  queryKey: ['orders'],
  fetcher: (variables) => client.get(`functions/v1/orders/${variables.id}`).then((res) => res.data.order),
  enabled: false,
});

export const useCreateOrder = createMutation<{ qrcode?: string; order_id: string }, Payload, AxiosError>({
  mutationFn: async (payload) =>
    client({
      url: 'functions/v1/orders',
      method: 'POST',
      data: payload,
    }).then((response) => {
      return {
        qrcode: response.data.qrcode,
        order_id: response.data.order_id,
      };
    }),
});
