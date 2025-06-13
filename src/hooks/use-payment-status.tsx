import { useEffect, useState } from 'react';

import { type PaymentCompletedEvent, subscribeToChannel, unsubscribeFromChannel } from '@/modules/pusher/pusher';
import { useGetOrder } from '@/resources/api/merchant/orders';

type PaymentStatus = 'pending' | 'completed' | 'failed';

/**
 * Hook to subscribe to payment status updates via Pusher
 */
export function usePaymentStatus(merchantId?: string, orderId?: string) {
  const [status, setStatus] = useState<PaymentStatus>('pending');

  const { refetch, data, isLoading } = useGetOrder({
    //@ts-ignore
    variables: { id: orderId },
    enabled: false,
  });

  // Function to manually check payment status
  const checkPaymentStatus = () => {
    refetch();
  };

  useEffect(() => {
    // Only subscribe if we have a merchantId
    if (!merchantId) return;

    const channelName = merchantId;
    const channel = subscribeToChannel(channelName);

    // Listen for payment status updates
    channel.bind('payment_completed', (data: PaymentCompletedEvent) => {
      if (data.order_id === orderId) {
        setStatus('completed');
      }
    });

    // Cleanup function
    return () => {
      unsubscribeFromChannel(channelName);
    };
  }, [merchantId, orderId]);

  useEffect(() => {
    console.log(data);
    if (data && data.status === 'COMPLETED') {
      setStatus('completed');
    }
  }, [data]);

  return {
    status,
    isLoading,
    checkPaymentStatus,
    isPending: status === 'pending',
    isCompleted: status === 'completed',
    isFailed: status === 'failed',
  };
}
