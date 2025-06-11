import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';

export default function OrdersPage() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <SafeAreaView className="flex-1">
          <Text>Orders</Text>
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
