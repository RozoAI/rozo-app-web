import { OverlayProvider } from '@gluestack-ui/overlay';
import { colorScheme as colorSchemeNW } from 'nativewind';
import React from 'react';
import { type ColorSchemeName, useColorScheme, type ViewProps } from 'react-native';

import { Box } from '@/components/ui/box';

import { config } from './config';

export type ModeType = 'light' | 'dark' | 'system';

const getColorSchemeName = (colorScheme: ColorSchemeName, mode: ModeType): 'light' | 'dark' => {
  if (mode === 'system') {
    return colorScheme ?? 'light';
  }
  return mode;
};

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const colorScheme = useColorScheme();

  const colorSchemeName = getColorSchemeName(colorScheme, mode);

  colorSchemeNW.set(mode);

  return (
    <Box style={[config[colorSchemeName!], { flex: 1, height: '100%', width: '100%' }, props.style]}>
      <OverlayProvider>{props.children}</OverlayProvider>
    </Box>
  );
}
