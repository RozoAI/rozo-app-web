import React from 'react';
import { Image, View } from 'react-native';

import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedTheme } from '@/hooks/use-selected-theme';
import { useApp } from '@/providers/app.provider';

export function PageLoader() {
  const { selectedTheme } = useSelectedTheme();
  const { merchant } = useApp();

  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center justify-center gap-4">
        {merchant?.logo_url ? (
          <Image source={{ uri: merchant.logo_url }} className="size-16 rounded-full" resizeMode="contain" />
        ) : selectedTheme === 'dark' ? (
          <LogoWhiteSvg width={64} height={64} />
        ) : (
          <LogoSvg width={64} height={64} />
        )}
        <Spinner size="small" />
      </View>
    </View>
  );
}
