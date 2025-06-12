import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import React from 'react';
import { type ViewProps } from 'react-native';

import { Box } from '@/components/ui/box';

import { config } from './config';

export type ModeType = 'light' | 'dark' | 'system';

export function GluestackUIProvider({
  mode = 'system',
  ...props
}: {
  children: React.ReactNode;
  mode?: ModeType;
  style?: ViewProps['style'];
}) {
  const configMode = useMemo(() => {
    return config[mode === 'dark' ? 'dark' : 'light'];
  }, [mode]);

  return (
    <Box style={[configMode, { flex: 1, height: '100%', width: '100%' }, props.style]}>
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </Box>
  );
}
