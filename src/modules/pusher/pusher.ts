import Pusher from 'pusher-js';

// Initialize Pusher with your credentials
// Replace these with your actual Pusher credentials
const PUSHER_APP_KEY = process.env.EXPO_PUBLIC_PUSHER_APP_KEY;
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER;

// Create a singleton Pusher instance
let pusherInstance: Pusher | null = null;

export function getPusherInstance(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_APP_KEY!, {
      cluster: PUSHER_CLUSTER!,
      forceTLS: true,
    });
  }
  return pusherInstance;
}

// Helper function to subscribe to a channel
export function subscribeToChannel(channelName: string) {
  const pusher = getPusherInstance();
  return pusher.subscribe(channelName);
}

// Helper function to unsubscribe from a channel
export function unsubscribeFromChannel(channelName: string) {
  const pusher = getPusherInstance();
  pusher.unsubscribe(channelName);
}

// Helper function to disconnect Pusher
export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}

// Types for Pusher events
export type PaymentCompletedEvent = {
  order_id: string;
  display_amount?: number;
  display_currency?: string;
  message?: string;
  timestamp?: string;
};
