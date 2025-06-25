import React from 'react';
import { View } from 'react-native';

import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedTheme } from '@/hooks/use-selected-theme';

export function PageLoader() {
  const { selectedTheme } = useSelectedTheme();

  return (
    <View className="flex-1 items-center justify-center bg-background-0">
      <View className="items-center justify-center gap-4">
        {selectedTheme === 'dark' ? <LogoWhiteSvg width={64} height={64} /> : <LogoSvg width={64} height={64} />}
        <Spinner size="small" />
      </View>
    </View>
  );
}
