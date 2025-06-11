import { createClient } from '@dynamic-labs/client';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import { WebExtension } from '@dynamic-labs/web-extension';

/**
 * Dynamic client configuration with deep linking support for authentication
 */
export const dynamicClient = createClient({
  environmentId: process.env.EXPO_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? '',
  appLogoUrl: 'https://rozo.ai/rozo-logo.png',
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'rozoai-pos',
})
  .extend(WebExtension())
  .extend(ReactNativeExtension());

export const useDynamic = () => useReactiveClient(dynamicClient);
