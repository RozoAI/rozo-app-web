import i18nInstance, { type i18n as I18nInstanceType } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';
import { getLanguage } from './utils';
export * from './utils';

/**
 * Initializes the i18next instance with the language from storage or defaults to 'en'.
 * @returns A Promise that resolves to the initialized i18n instance.
 */
async function initialize(): Promise<I18nInstanceType> {
  const language = await getLanguage();
  await i18nInstance.use(initReactI18next).init({
    resources,
    lng: language || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // escape passed in values to avoid XSS injections
    },
  });
  return i18nInstance;
}

// Export a promise that resolves when i18n is initialized.
// The application's entry point should await this promise or use .then()
// to ensure i18n is ready before rendering the main application.
export const i18nPromise: Promise<I18nInstanceType> = initialize();

// Export the i18n instance directly. Consumers should ideally wait for i18nPromise to resolve.
export default i18nInstance;
