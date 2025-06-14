import { useRouter } from 'expo-router';
import React, { useContext, useMemo } from 'react';
import { createContext, useEffect, useState } from 'react';

import { PageLoader } from '@/components/loader/loader';
import { showToast, storage } from '@/lib';
import { type CurrencyConfig, currencyConfigs } from '@/lib/currency-config';
import { useDynamic } from '@/modules/dynamic/dynamic-client';
// eslint-disable-next-line import/no-cycle
import { useGetProfile } from '@/resources/api';
import { type MerchantProfile } from '@/resources/schema/merchant';

interface IContextProps {
  isAuthenticated: boolean;
  token: string | undefined;
  merchant: MerchantProfile | undefined;
  defaultCurrency: CurrencyConfig | undefined;
  setToken: (token: string | undefined) => void;
  setMerchant: (merchant: MerchantProfile | undefined) => void;
}

export const AppContext = createContext<IContextProps>({
  isAuthenticated: false,
  token: undefined,
  merchant: undefined,
  defaultCurrency: undefined,
  setToken: () => {},
  setMerchant: () => {},
});

interface IProviderProps {
  children: React.ReactNode;
}

export const TOKEN_KEY = '_auth_token';

export const AppProvider: React.FC<IProviderProps> = ({ children }) => {
  const { refetch, data, error } = useGetProfile();
  const { auth } = useDynamic();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [token, setToken] = useState<string | undefined>();
  const [merchant, setMerchant] = useState<MerchantProfile>();

  const initApp = async () => {
    setIsLoading(true);
    const token = auth?.token;

    setToken(token ?? undefined);
    if (token) {
      storage.set(TOKEN_KEY, token);
    }
  };

  const defaultCurrency = useMemo(() => {
    const currency = merchant?.default_currency ?? 'USD';
    return currencyConfigs[currency];
  }, [merchant]);

  useEffect(() => {
    initApp();
  }, [auth?.token]);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      refetch();
    } else {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [token]);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      setMerchant(data);
    }

    if (error) {
      showToast({
        type: 'danger',
        message: error?.message ?? 'Failed to get profile',
      });

      setIsLoading(false);
      router.replace('/error');
    }
  }, [data, error]);

  const contextPayload = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      merchant,
      defaultCurrency,
      setToken,
      setMerchant,
    }),
    [token, merchant]
  );

  return <AppContext.Provider value={contextPayload}>{isLoading ? <PageLoader /> : children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
