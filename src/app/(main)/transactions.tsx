import React from 'react';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { TransactionScreen } from '@/features/transactions/transaction-screen';

export default function SettingsPage() {
  return (
    <>
      <FocusAwareStatusBar />
      <TransactionScreen />
    </>
  );
}
