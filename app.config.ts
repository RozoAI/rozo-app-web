/* eslint-disable max-lines-per-function */
import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';

const version = process.env.EXPO_PUBLIC_VERSION ?? '0.0.1';
const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

const isProduction = appEnv === 'production';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: !isProduction,
  badges: [
    {
      text: appEnv,
      type: 'banner',
      color: 'white',
    },
    {
      text: version ?? '0.0.0',
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_APP_NAME ?? 'rozoai-pos',
  description: `${process.env.EXPO_PUBLIC_APP_NAME ?? 'rozoai-pos'} Mobile App`,
  owner: process.env.EXPO_PUBLIC_EAS_ACCOUNT_OWNER ?? 'rozoai',
  scheme: 'rozopos', // Custom URL scheme for deep linking
  slug: process.env.EXPO_PUBLIC_SLUG ?? 'rozoai-pos',
  version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  jsEngine: 'hermes',
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/a40a9a82-88ef-405a-a4db-21a2f9ec9996',
  },
  runtimeVersion: version,
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.EXPO_PUBLIC_BUNDLE_ID,
    userInterfaceStyle: 'automatic',
    config: {
      usesNonExemptEncryption: false, // Avoid the export compliance warning on the app store
    },
    associatedDomains: ['applinks:rozo.ai', 'applinks:*.rozo.ai'],
  },
  experiments: {
    typedRoutes: true,
    reactCanary: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: process.env.EXPO_PUBLIC_PACKAGE,
    userInterfaceStyle: 'automatic',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: '*.rozo.ai',
            pathPrefix: '/login',
          },
          {
            scheme: 'https',
            host: 'rozo.ai',
            pathPrefix: '/login',
          },
          {
            scheme: 'rozopos', // Custom URL scheme
            host: '*',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'single',
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFFFFF',
        image: './assets/splash-icon.png',
        imageWidth: 150,
      },
    ],
    [
      'expo-font',
      {
        fonts: [
          'node_modules/@expo-google-fonts/roboto/300Light/Roboto_300Light.ttf',
          'node_modules/@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf',
          'node_modules/@expo-google-fonts/roboto/500Medium/Roboto_500Medium.ttf',
          'node_modules/@expo-google-fonts/roboto/600SemiBold/Roboto_600SemiBold.ttf',
          'node_modules/@expo-google-fonts/roboto/700Bold/Roboto_700Bold.ttf',
          'node_modules/@expo-google-fonts/roboto/800ExtraBold/Roboto_800ExtraBold.ttf',
        ],
      },
    ],
    'expo-localization',
    'expo-router',
    'expo-secure-store',
    ['app-icon-badge', appIconBadgeConfig],
    ['react-native-edge-to-edge'],
  ],
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
    },
  },
});
