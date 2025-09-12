import React from 'react';

import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import SettingScreenV2 from '@/features/v2/settings/setting-screen';

export default function SettingsPage() {
  return (
    <>
      <FocusAwareStatusBar />
      <SettingScreenV2 />
    </>
  );
}
