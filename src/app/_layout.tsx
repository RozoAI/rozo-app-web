// Import global CSS file
import '@/styles/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen'; // Correct import
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react'; // Import hooks
import { I18nextProvider } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native'; // Import View
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import { GluestackUIProvider } from '@/components/gluestack-ui-provider';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { WebFontsLoader } from '@/components/web-fonts-loader';
import { loadSelectedTheme } from '@/hooks/use-selected-theme';
import { darkTheme, defaultTheme } from '@/lib/theme';
import { dynamicClient } from '@/modules/dynamic/dynamic-client';
import { configureDynamicDeepLinks } from '@/modules/dynamic/dynamic-linking';
import i18n from '@/modules/i18n';
import { AppProvider } from '@/providers/app.provider';
import { POSToggleProvider } from '@/providers/pos-toggle.provider';
import { QueryProvider } from '@/providers/query.provider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(main)',
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 1. State to track if all assets are loaded
  const [isReady, setIsReady] = useState(false);

  // 2. The main effect to prepare the app
  useEffect(() => {
    async function prepare() {
      try {
        // Here you can await all your async startup tasks
        await loadSelectedTheme();
        configureDynamicDeepLinks(); // This can run in parallel if not awaited

        // You can add other tasks here, like checking for an auth token
        // await checkUserAuthentication();
      } catch (e) {
        // We'll want to show the app even if something fails, but log the error
        console.warn(e);
      } finally {
        // Tell the application it's ready to render
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  // 3. A callback for hiding the splash screen after the layout is rendered
  const onLayoutRootView = useCallback(async () => {
    // We hide the splash screen only when the app is ready AND fonts are loaded
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  // 4. Don't render anything until all assets are ready
  if (!isReady) {
    return null;
  }

  // 5. Render the app and pass the onLayout callback down to the Providers
  return (
    <Providers onLayout={onLayoutRootView}>
      <Stack>
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

// 6. Modify Providers to accept and use the onLayout prop
function Providers({ children, onLayout }: { children: React.ReactNode; onLayout: () => void }) {
  const theme = useColorScheme();

  return (
    <I18nextProvider i18n={i18n}>
      <Toast />
      <GluestackUIProvider mode={theme.colorScheme}>
        {/* The onLayout prop is attached to the absolute root view */}
        <GestureHandlerRootView style={styles.container} className={theme.colorScheme} onLayout={onLayout}>
          <ThemeProvider value={theme.colorScheme === 'dark' ? darkTheme : defaultTheme}>
            <QueryProvider>
              {/* Network connection status overlay */}
              <ConnectionStatus />
              {/* @ts-ignore */}
              <dynamicClient.reactNative.WebView />
              <KeyboardProvider>
                <AppProvider>
                  <POSToggleProvider>
                    {Platform.OS === 'web' ? <WebFontsLoader>{children}</WebFontsLoader> : children}
                  </POSToggleProvider>
                </AppProvider>
              </KeyboardProvider>
            </QueryProvider>
          </ThemeProvider>
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
