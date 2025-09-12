import React from 'react';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { BalanceScreenV2 } from '@/features/v2/balance/balance-screen';

export default function IndexPage() {
  return (
    <>
      <FocusAwareStatusBar />
      <BalanceScreenV2 />
    </>
  );
}
