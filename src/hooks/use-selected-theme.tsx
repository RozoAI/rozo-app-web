import { colorScheme, useColorScheme } from 'nativewind';
import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/lib/storage';

const SELECTED_THEME = '_theme';
export type ColorSchemeType = 'light' | 'dark' | 'system';

/**
 * Loads the selected theme from AsyncStorage and applies it.
 * @returns A Promise that resolves to the loaded theme or null if not found.
 */
export const loadSelectedTheme = async (): Promise<ColorSchemeType | null> => {
  const theme = await storage.getString(SELECTED_THEME);
  if (theme) {
    colorScheme.set(theme as ColorSchemeType);
    return theme as ColorSchemeType;
  }
  return null;
};

/**
 * Hook for managing the selected color scheme (theme).
 * It initializes the theme from AsyncStorage and provides a function to update it.
 * Note: For styling components based on the current theme, use `useColorScheme` from NativeWind directly.
 */
export const useSelectedTheme = () => {
  const { colorScheme: nativewindTheme, setColorScheme } = useColorScheme();
  const [selectedTheme, setSelectedThemeState] = useState<ColorSchemeType | undefined | null>(undefined);

  useEffect(() => {
    const initTheme = async () => {
      const loadedTheme = await loadSelectedTheme();
      if (loadedTheme) {
        setSelectedThemeState(loadedTheme);
      } else {
        // If no theme is in storage, use the current theme from NativeWind (which could be system default)
        setSelectedThemeState(nativewindTheme);
      }
    };
    initTheme();
  }, [nativewindTheme]); // Add nativewindTheme as a dependency

  const updateSelectedTheme = useCallback(
    async (newTheme: ColorSchemeType) => {
      setColorScheme(newTheme); // Update NativeWind's theme
      setSelectedThemeState(newTheme); // Update local state
      console.log(newTheme);
      await storage.setItem(SELECTED_THEME, newTheme); // Persist to AsyncStorage
    },
    [setColorScheme]
  );

  return { selectedTheme, setSelectedTheme: updateSelectedTheme } as const;
};
