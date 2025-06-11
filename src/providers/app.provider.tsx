import React, { useContext } from 'react';
import { createContext, useEffect, useState } from 'react';

import { useGetProfile } from '@/resources/api';
import { type MerchantProfile } from '@/resources/schema/merchant';

interface IContextProps {
  isAuthenticated: boolean;
  token: string | undefined;
  merchant: MerchantProfile | undefined;
  setToken: (token: string | undefined) => void;
  setMerchant: (merchant: MerchantProfile | undefined) => void;
}

export const AppContext = createContext<IContextProps>({
  isAuthenticated: false,
  token: undefined,
  merchant: undefined,
  setToken: () => {},
  setMerchant: () => {},
});

interface IProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<IProviderProps> = ({ children }) => {
  const { refetch, data, isSuccess } = useGetProfile();

  const [token, setToken] = useState<string>();
  const [merchant, setMerchant] = useState<MerchantProfile>();

  const initApp = async () => {
    const suffix = process.env.EXPO_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? '';
    const token = localStorage.getItem(`dynamic_authentication_token_${suffix}`);

    if (token) {
      setToken(token);
    }
  };

  const handleMerchant = (merchant: MerchantProfile | undefined) => {
    setMerchant(merchant);
  };

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token]);

  useEffect(() => {
    if (isSuccess && data) {
      handleMerchant(data);
    }
  }, [data, isSuccess]);

  const contextPayload = React.useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      merchant,
      setToken,
      setMerchant: handleMerchant,
    }),
    [token, merchant]
  );

  return <AppContext.Provider value={contextPayload}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
