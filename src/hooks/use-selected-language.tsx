import i18n from 'i18next'; // Import the i18n instance directly
import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/lib/storage';
import { LOCAL } from '@/modules/i18n'; // LOCAL key for storage
import { type Language } from '@/modules/i18n/resources'; // Correct path for Language type

// It's good practice to define storage keys as constants
const SELECTED_LANGUAGE_KEY = LOCAL; // Using LOCAL as the key for consistency

export const useSelectedLanguage = (): {
  language: Language | undefined;
  setLanguage: (lang: Language) => Promise<void>;
} => {
  const [language, setLanguageState] = useState<Language | undefined>(undefined);

  // Load language from AsyncStorage on mount
  useEffect(() => {
    const loadLanguage = async (): Promise<void> => {
      const storedLanguage = await storage.getString(SELECTED_LANGUAGE_KEY);
      if (storedLanguage) {
        const lang = storedLanguage as Language;
        setLanguageState(lang);
        // Ensure i18n instance is also updated if it wasn't during init
        if (i18n.language !== lang) {
          await i18n.changeLanguage(lang);
        }
      } else {
        // Fallback to default i18n language if nothing is stored
        setLanguageState(i18n.language as Language);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language): Promise<void> => {
    setLanguageState(lang);
    await i18n.changeLanguage(lang); // Update i18next instance
    await storage.setItem(SELECTED_LANGUAGE_KEY, lang.replace(/^"|"$/g, '')); // Persist to AsyncStorage
  }, []);

  return { language, setLanguage };
};
