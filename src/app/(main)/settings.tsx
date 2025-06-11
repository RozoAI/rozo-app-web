import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { Button, ButtonText } from '@/components/ui/button';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useDynamic } from '@/modules/dynamic/dynamic-client';
import { useApp } from '@/providers/app.provider';

export default function SettingsPage() {
  const { auth } = useDynamic();
  const { setToken, setMerchant, merchant } = useApp();
  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    setToken(undefined);
    setMerchant(undefined);

    router.replace('/login');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <SafeAreaView className="flex-1">
          <Text>{merchant?.display_name}</Text>
          <Button onPress={() => handleLogout()} action="negative">
            <ButtonText>Logout</ButtonText>
          </Button>
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
