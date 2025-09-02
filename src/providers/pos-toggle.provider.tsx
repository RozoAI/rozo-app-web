import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getItem, setItem } from '@/lib/storage';
import { useApp } from '@/providers/app.provider';

const POS_TOGGLE_BASE_KEY = 'show_pos_toggle';

interface POSToggleContextProps {
  showPOS: boolean;
  togglePOS: (value: boolean) => Promise<void>;
}

const POSToggleContext = createContext<POSToggleContextProps>({
  showPOS: false,
  togglePOS: async () => {},
});

interface POSToggleProviderProps {
  children: React.ReactNode;
}

export function POSToggleProvider({ children }: POSToggleProviderProps) {
  const { primaryWallet } = useApp();

  const userPOSToggleKey = useMemo(() => {
    const walletAddress = primaryWallet?.address;
    return walletAddress ? `${POS_TOGGLE_BASE_KEY}_${walletAddress}` : POS_TOGGLE_BASE_KEY;
  }, [primaryWallet?.address]);

  const [showPOS, setShowPOS] = useState<boolean>(false);

  useEffect(() => {
    const saved = getItem<boolean>(userPOSToggleKey);
    const newValue = saved ?? false;
    setShowPOS(newValue);
  }, [userPOSToggleKey]);

  const togglePOS = useCallback(
    async (value: boolean) => {
      setShowPOS(value);
      await setItem(userPOSToggleKey, value);
    },
    [userPOSToggleKey]
  );

  const contextValue = useMemo(
    () => ({
      showPOS,
      togglePOS,
    }),
    [showPOS, togglePOS]
  );

  return <POSToggleContext.Provider value={contextValue}>{children}</POSToggleContext.Provider>;
}

export function usePOSToggle() {
  const context = useContext(POSToggleContext);
  if (!context) {
    throw new Error('usePOSToggle must be used within a POSToggleProvider');
  }
  return context;
}
