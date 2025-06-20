import { ChainEnum } from '@dynamic-labs/sdk-api-core';
import { useDynamicContext, useDynamicWaas } from '@dynamic-labs/sdk-react-core';
import { type BaseWallet } from '@dynamic-labs/types';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { PageLoader } from '@/components/loader/loader';
import { showToast, storage } from '@/lib';
import { currencies, type CurrencyConfig } from '@/lib/currencies';
import { defaultToken, type Token, tokens } from '@/lib/tokens';
import { DYNAMIC_TOKEN_KEY } from '@/modules/axios/client';
import { useCreateProfile, useGetProfile } from '@/resources/api';
import { type MerchantProfile } from '@/resources/schema/merchant';

/**
 * The shape of the authentication context.
 */
interface IContextProps {
  isAuthenticated: boolean;
  token: string | undefined;
  merchant: MerchantProfile | undefined;
  defaultCurrency: CurrencyConfig | undefined;
  merchantToken: Token | undefined;
  wallets: BaseWallet[];
  primaryWallet: BaseWallet | undefined;
  isAuthLoading: boolean;
  setMerchant: (merchant: MerchantProfile) => void;
  showAuthModal: () => void;
  logout: () => Promise<void>;
}

export const AppContext = createContext<IContextProps>({
  isAuthenticated: false,
  token: undefined,
  merchant: undefined,
  defaultCurrency: undefined,
  merchantToken: undefined,
  wallets: [],
  primaryWallet: undefined,
  isAuthLoading: false,
  setMerchant: () => {},
  showAuthModal: () => {},
  logout: async () => {},
});

interface IProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<IProviderProps> = ({ children }) => {
  const { refetch: fetchProfile, data: profileData, error: profileError } = useGetProfile();
  const { mutateAsync: createProfile } = useCreateProfile();
  const { primaryWallet, user, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const { createWalletAccount } = useDynamicWaas();

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [merchant, setMerchant] = useState<MerchantProfile>();
  const [userWallets, setUserWallets] = useState<BaseWallet[]>([]);

  const isAuthenticated = !!user;
  const router = useRouter();

  const clearStorage = async () => {
    await handleLogOut();
    setMerchant(undefined);
    setUserWallets([]);
    setToken(undefined);
    await storage.delete(DYNAMIC_TOKEN_KEY);
  };

  const logout = useCallback(async () => {
    try {
      await clearStorage();
      router.replace('/login');
    } catch (_err) {
      showToast({
        type: 'danger',
        message: 'Failed to logout',
      });
    }
  }, [handleLogOut, router]);

  const createMerchantProfile = useCallback(
    async (userData: any) => {
      setIsAppLoading(true);
      try {
        let walletAddress = '';

        if (primaryWallet) {
          walletAddress = primaryWallet.address;
        } else {
          // Create wallet
          const wallets = await createWalletAccount([ChainEnum.Evm]);
          if (wallets && wallets.length > 0 && wallets[0]) {
            walletAddress = wallets[0].accountAddress;
          } else {
            throw new Error('Failed to create wallet');
          }
        }

        await createProfile({
          email: userData?.email ?? '',
          display_name: userData?.email ?? '',
          description: '',
          logo_url: '',
          default_currency: 'USD',
          default_language: 'EN',
          default_token_id: defaultToken?.key,
          wallet_address: walletAddress ?? '',
        });
        showToast({ type: 'success', message: 'Welcome to Rozo POS' });
        await fetchProfile(); // Refetch profile after creation
        router.navigate('/');
      } catch (error: any) {
        logout();
        setIsAuthLoading(false);
        showToast({ type: 'danger', message: error?.message ?? 'Failed to create profile' });
      }
    },
    [createProfile, primaryWallet, router, fetchProfile]
  );

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = await storage.getString(DYNAMIC_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        setIsAppLoading(true);
        await fetchProfile();
      }
    };

    if (user) {
      initAuth();
    } else {
      // clearStorage();
      setIsAppLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (primaryWallet) {
      setUserWallets([primaryWallet as unknown as BaseWallet]);
    } else {
      setUserWallets([]);
    }
  }, [primaryWallet]);

  useEffect(() => {
    if (profileData) {
      setMerchant(profileData);
      setIsAppLoading(false);
      setIsAuthLoading(false);
    }

    if (profileError) {
      // If profile not found (404) and user is authenticated, create one
      if (user && profileError.message.includes('multiple (or no) rows returned')) {
        createMerchantProfile(user);
      } else {
        clearStorage();
        showToast({ type: 'danger', message: profileError?.message ?? 'Failed to get profile' });
        setIsAuthLoading(false);
        // Optional: redirect to an error page or login
        router.replace('/login');
      }
    }
  }, [profileData, profileError, user, createMerchantProfile, router]);

  const showAuthModal = useCallback(() => {
    setShowAuthFlow(true);
  }, [setShowAuthFlow]);

  const merchantToken = useMemo(() => {
    if (merchant?.default_token_id) {
      return tokens.find((token) => token.key === merchant.default_token_id);
    }
    return defaultToken;
  }, [merchant]);

  const defaultCurrency = useMemo(() => {
    const currencyCode = merchant?.default_currency ?? 'USD';
    return currencies[currencyCode];
  }, [merchant]);

  const contextPayload = useMemo(
    () => ({
      isAuthenticated,
      token,
      merchant,
      defaultCurrency,
      merchantToken,
      wallets: userWallets,
      primaryWallet: primaryWallet as BaseWallet | undefined,
      isAuthLoading,
      showAuthModal,
      logout,
      setMerchant,
    }),
    [
      isAuthenticated,
      token,
      merchant,
      defaultCurrency,
      merchantToken,
      userWallets,
      primaryWallet,
      isAuthLoading,
      showAuthModal,
      logout,
      setMerchant,
    ]
  );

  return <AppContext.Provider value={contextPayload}>{isAppLoading ? <PageLoader /> : children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
