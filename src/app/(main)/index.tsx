import React from 'react';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { PaymentScreen } from '@/features/payment';

export default function HomePage() {
  return (
    <>
      <FocusAwareStatusBar />
      <PaymentScreen />
    </>
  );
}
