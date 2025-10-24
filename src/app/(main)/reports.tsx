import React from 'react';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { ReportsScreen } from '@/features/reports/reports-screen';

export default function ReportsPage() {
  return (
    <>
      <FocusAwareStatusBar />
      <ReportsScreen />
    </>
  );
}
