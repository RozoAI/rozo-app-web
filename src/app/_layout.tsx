// Import  global CSS file
import '@/styles/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { GluestackUIProvider } from '@/components/gluestack-ui-provider';
import { WebFontsLoader } from '@/components/web-fonts-loader';
import { loadSelectedTheme } from '@/hooks';
import { darkTheme, defaultTheme } from '@/lib/theme';
import { dynamicClient } from '@/modules/dynamic/dynamic-client';
import { configureDynamicDeepLinks } from '@/modules/dynamic/dynamic-linking';
import i18n from '@/modules/i18n';
import { AppProvider } from '@/providers/app.provider';
import { QueryProvider } from '@/providers/query.provider';
export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(main)',
};

loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  // Initialize deep linking for authentication when the app starts
  useEffect(() => {
    configureDynamicDeepLinks();
  }, []);

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useColorScheme();

  return (
    <I18nextProvider i18n={i18n}>
      <GluestackUIProvider mode={theme.colorScheme}>
        <GestureHandlerRootView style={styles.container} className={theme.colorScheme}>
          <KeyboardProvider>
            <ThemeProvider value={theme.colorScheme === 'dark' ? darkTheme : defaultTheme}>
              <QueryProvider>
                <AppProvider>
                  {Platform.OS === 'web' ? <WebFontsLoader>{children}</WebFontsLoader> : children}

                  <dynamicClient.reactNative.WebView />
                  {/* @ts-ignore */}
                  <FlashMessage position="top" />
                </AppProvider>
              </QueryProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </GluestackUIProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
