import React from 'react';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { RecentOrdersScreen } from '@/features/orders/order-list';

export default function OrdersPage() {
  return (
    <>
      <FocusAwareStatusBar />
      <RecentOrdersScreen />
    </>
  );
}
