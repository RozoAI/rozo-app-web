import type { NetInfoState } from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import { WifiOffIcon } from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type ConnectionStatusProps = {
  message?: string;
};

export function ConnectionStatus({ message }: ConnectionStatusProps): React.ReactElement | null {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
    });

    // Check initial connection state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // If connected or connection state is unknown, don't show anything
  if (isConnected === true || isConnected === null) {
    return null;
  }

  // Show the no connection overlay when disconnected
  return (
    <View style={styles.overlay}>
      <View className="m-8 items-center rounded-xl bg-background-100 p-4 dark:bg-background-800">
        <Icon as={WifiOffIcon} className="mb-2 text-red-500" size="xl" />
        <Text className="text-center text-lg font-semibold">
          {message || t('general.noConnection', 'No internet connection')}
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('general.checkConnection', 'Please check your connection and try again')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
