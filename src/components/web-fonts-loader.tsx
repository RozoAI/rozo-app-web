// WebFontsLoader.tsx

import { Roboto_300Light } from '@expo-google-fonts/roboto/300Light';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_600SemiBold } from '@expo-google-fonts/roboto/600SemiBold';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { Roboto_800ExtraBold } from '@expo-google-fonts/roboto/800ExtraBold';
import { useFonts } from '@expo-google-fonts/roboto/useFonts';
import { useEffect, useState } from 'react';

const MIN_FALLBACK_DURATION = 500;

/**
 * For web only: include this to load woff2 fonts.
 * For native platforms, otf files are bundled via app.json.
 */
export function WebFontsLoader({ children, fallback }: { children?: React.ReactNode; fallback?: React.ReactNode }) {
  const hasFallback = !!fallback;
  const [forceFallback, setForceFallback] = useState(hasFallback);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setForceFallback(false);
    }, MIN_FALLBACK_DURATION);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const [loaded, error] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Roboto_800ExtraBold,
  });

  return (loaded || error) && !forceFallback ? children : fallback;
}
