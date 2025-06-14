import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import type { PaymentCompletedEvent } from '@/modules/pusher/pusher';
import { subscribeToChannel, unsubscribeFromChannel } from '@/modules/pusher/pusher';
import { useGetOrder } from '@/resources/api/merchant/orders';

type PaymentStatus = 'pending' | 'completed' | 'failed';

/**
 * Hook to subscribe to payment status updates via Pusher
 * Works with both web (pusher-js) and native (@pusher/pusher-websocket-react-native) platforms
 */
export function usePaymentStatus(merchantId?: string, orderId?: string) {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const isWeb = Platform.OS === 'web';

  const { refetch, data, isLoading } = useGetOrder({
    variables: { id: orderId ?? '' },
    enabled: false,
  });

  // Function to manually check payment status
  const checkPaymentStatus = () => {
    refetch();
  };

  useEffect(() => {
    // Only subscribe if we have a merchantId and orderId
    if (!merchantId || !orderId) return;

    const channelName = merchantId;
    let isMounted = true;

    // Setup Pusher channel and event binding
    const setupPusher = async () => {
      try {
        // Subscribe to the channel with event handler for payment_completed event
        // The subscribeToChannel function handles platform differences internally
        await subscribeToChannel(channelName, 'payment_completed', (data: PaymentCompletedEvent) => {
          if (data.order_id === orderId && isMounted) {
            setStatus('completed');
            console.log(`Payment completed for order ${orderId}`);
          }
        });

        console.log(`Subscribed to ${channelName} channel on ${isWeb ? 'web' : 'native'} platform`);
      } catch (error) {
        console.error('Error setting up Pusher:', error);
      }
    };

    setupPusher();

    // Cleanup function
    return () => {
      isMounted = false;
      if (channelName) {
        // Unsubscribe from channel
        const cleanup = async () => {
          try {
            await unsubscribeFromChannel(channelName);
            console.log(`Unsubscribed from ${channelName} channel`);
          } catch (error) {
            console.error('Error cleaning up Pusher:', error);
          }
        };

        cleanup();
      }
    };
  }, [merchantId, orderId, isWeb]);

  useEffect(() => {
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
