import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

/**
 * Configure deep linking for Dynamic authentication
 * This handles the redirect flow for social logins like Google
 */
export function configureDynamicDeepLinks() {
  // Set up URL listener for handling authentication redirects
  Linking.addEventListener('url', handleRedirect);

  // Get the initial URL that opened the app
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleRedirect({ url });
    }
  });
}

/**
 * Handle deep link redirects from authentication providers
 */
async function handleRedirect({ url }: { url: string }) {
  if (!url) return;

  // Check if this URL is an authentication redirect
  if (url.includes('rozo.ai/login') || url.startsWith('rozopos://login')) {
    try {
      // Close any open authentication browser windows
      await WebBrowser.dismissAuthSession();

      // Process the authentication URL
      // Dynamic will handle this internally through its SDK
      console.log('Processing authentication redirect URL:', url);

      // The WebView component from Dynamic handles the redirect automatically
      // We just need to make sure the URL is processed by the app

      console.log('Successfully processed authentication redirect');
    } catch (error) {
      console.error('Error handling authentication redirect:', error);
    }
  }
}
