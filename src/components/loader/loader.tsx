import React from 'react';
import { View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedTheme } from '@/hooks';

export function PageLoader() {
  const { selectedTheme } = useSelectedTheme();

  return (
    <View className="flex-1 items-center justify-center bg-background-0">
      <View className="items-center justify-center gap-4">
        <Image
          source={
            selectedTheme === 'dark' ? require('@/components/svg/logo-white.svg') : require('@/components/svg/logo.svg')
          }
          size="xs"
          alt="Rozo POS"
        />
        <Spinner size="small" />
      </View>
    </View>
  );
}
