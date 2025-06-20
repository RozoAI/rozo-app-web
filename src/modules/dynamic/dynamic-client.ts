import { createClient } from '@dynamic-labs/client';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import { type IViemExtension, ViemExtension } from '@dynamic-labs/viem-extension';
import { WebExtension } from '@dynamic-labs/web-extension';
import { ZeroDevExtension } from '@dynamic-labs/zerodev-extension';
import { Platform } from 'react-native';

/**
 * Dynamic client configuration with deep linking support for authentication
 */

type DynamicClient = ReturnType<typeof createClient> & IViemExtension & { zeroDev: any };

/**
 * Initialize the Dynamic client with appropriate extensions based on platform
 */
let client = createClient({
  environmentId: process.env.EXPO_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? '',
  appLogoUrl: 'https://rozo.ai/rozo-logo.png',
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'Rozo POS',
});

// Always add ReactNativeExtension
client = client.extend(ReactNativeExtension());

// Add WebExtension only on web platform
if (Platform.OS === 'web') {
  client = client.extend(WebExtension());
}

// Export with proper typing
export const dynamicClient = client.extend(ViemExtension()).extend(ZeroDevExtension()) as DynamicClient;

export const useDynamic = () => useReactiveClient(dynamicClient);
