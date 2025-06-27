import { type BaseWallet } from '@dynamic-labs/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useMemo } from 'react';
import { createContext, useEffect, useState } from 'react';

import { PageLoader } from '@/components/loader/loader';
import { useSelectedLanguage } from '@/hooks/use-selected-language';
import { getItem, removeItem, setItem, showToast, storage } from '@/lib';
import { currencies, type CurrencyConfig } from '@/lib/currencies';
import { AppError } from '@/lib/error';
import { defaultToken, type Token, tokens } from '@/lib/tokens';
import { useDynamic } from '@/modules/dynamic/dynamic-client';
// eslint-disable-next-line import/no-cycle
import { useCreateProfile, useGetProfile } from '@/resources/api';
import { type MerchantProfile } from '@/resources/schema/merchant';

interface IContextProps {
  isAuthenticated: boolean;
  token: string | undefined;
  merchant: MerchantProfile | undefined;
  defaultCurrency: CurrencyConfig | undefined;
  merchantToken: Token | undefined;
  wallets: BaseWallet[];
  primaryWallet: BaseWallet | null;
  isAuthLoading: boolean;
  showAuthModal: () => void;
  setToken: (token: string | undefined) => void;
  setMerchant: (merchant: MerchantProfile | undefined) => void;
  logout: () => Promise<void>;
}

export const AppContext = createContext<IContextProps>({
  isAuthenticated: false,
  token: undefined,
  merchant: undefined,
  defaultCurrency: undefined,
  merchantToken: undefined,
  wallets: [],
  primaryWallet: null,
  isAuthLoading: false,
  showAuthModal: () => {},
  setToken: () => {},
  setMerchant: () => {},
  logout: async () => {},
});

interface IProviderProps {
  children: React.ReactNode;
}

export const TOKEN_KEY = '_auth_token';
export const MERCHANT_KEY = '_merchant_profile';

export const AppProvider: React.FC<IProviderProps> = ({ children }) => {
  const { refetch: fetchProfile, data: profileData, error: profileError } = useGetProfile();
  const { mutateAsync: createProfile } = useCreateProfile();
  const { auth, wallets, ui, sdk } = useDynamic();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();
  const { language } = useSelectedLanguage();

  const [token, setToken] = useState<string | undefined>();
  const [merchant, setMerchant] = useState<MerchantProfile>();
  const [userWallets, setUserWallets] = useState<BaseWallet[]>([]);

  // Function to store merchant data in storage
  const storeMerchantData = useCallback((merchantData: MerchantProfile) => {
    setItem<MerchantProfile>(MERCHANT_KEY, merchantData);
  }, []);

  // Function to clear merchant data from storage
  const clearMerchantData = useCallback(() => {
    removeItem(MERCHANT_KEY);
  }, []);

  // Enhanced setMerchant function that also updates storage
  const handleSetMerchant = useCallback(
    (merchantData: MerchantProfile | undefined) => {
      setMerchant(merchantData);
      if (merchantData) {
        storeMerchantData(merchantData);
      } else {
        clearMerchantData();
      }
    },
    [storeMerchantData, clearMerchantData]
  );

  // Initialize the application with auth state
  const initApp = async (token: string) => {
    setIsLoading(true);

    // Check for cached merchant data
    const cachedMerchant = getItem<MerchantProfile>(MERCHANT_KEY);

    // Set token if available
    setToken(token);
    setItem(TOKEN_KEY, token);

    // If we have cached merchant data, use it immediately to speed up initial load
    if (cachedMerchant) {
      setMerchant(cachedMerchant);

      setIsLoading(false);
      // Still fetch fresh data in the background
      fetchProfile();
    }
  };

  // Handle wallet information
  const updateWalletInfo = () => {
    if (wallets?.userWallets) {
      /* const formattedWallets: UserWallet[] = wallets.userWallets.map((wallet: any) => ({
        address: wallet.address,
        chain: wallet.chain,
        walletKey: wallet.key,
        isConnected: wallet.isAuthenticated,
      })); */
      setUserWallets(wallets.userWallets);
    }
  };

  // Get primary wallet (EVM Zero Dev wallet by default)
  const primaryWallet = useMemo(() => {
    return wallets?.primary;
  }, [wallets?.primary]);

  const merchantToken = useMemo(() => {
    if (merchant?.default_token_id) {
      return tokens.find((token) => token.key === merchant?.default_token_id);
    }
    return defaultToken;
  }, [merchant]);

  // Get default currency from merchant profile
  const defaultCurrency = useMemo(() => {
    const currency = merchant?.default_currency ?? 'USD';
    return currencies[currency];
  }, [merchant]);

  // Logout function
  const logout = async () => {
    try {
      await auth.logout();
      setToken(undefined);
      setMerchant(undefined);
      setUserWallets([]);
      // Clear both token and merchant data from storage
      storage.delete(TOKEN_KEY);
      clearMerchantData();
      router.replace('/login');
    } catch (_err) {
      showToast({
        type: 'danger',
        message: 'Failed to logout',
      });
    }
  };

  // Initialize app when auth token changes
  useEffect(() => {
    if (auth?.token) {
      initApp(auth?.token);
    } else {
      // Clear token and merchant data if not available
      setToken(undefined);
      // clearMerchantData();
      storage.delete(TOKEN_KEY);
      // setTimeout(() => {
      //   setIsLoading(false);
      // }, 6000);
    }
  }, [auth?.token]);

  // Update wallet information when wallets change
  useEffect(() => {
    updateWalletInfo();
  }, [wallets?.userWallets]);

  // Fetch merchant profile when token is available
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchProfile();
    }
  }, [token, fetchProfile]);

  // Handle merchant profile data and errors
  useEffect(() => {
    if (profileData) {
      setIsLoading(false);
      // Update merchant data in state and storage
      handleSetMerchant(profileData);
    }

    if (profileError && profileError instanceof AppError) {
      if (profileError.statusCode >= 400) {
        logout();
      } else {
        showToast({
          type: 'danger',
          message: profileError?.message ?? 'Failed to get profile',
        });

        setIsLoading(false);
        router.replace('/error');
      }
    }
  }, [profileData, profileError, router]);

  /**
   * Show the authentication modal
   */
  const showAuthModal = useCallback(() => {
    if (auth.token) {
      auth.logout().then(() => {
        ui.auth.show();
      });
    } else {
      ui.auth.show();
    }
  }, [ui]);

  /**
   * Create merchant profile with user data
   */
  const createMerchantProfile = useCallback(
    async (user: any) => {
      try {
        // Handle success directly here
        if (auth.token) {
          if (user?.newUser) {
            // const evmWallet = userWallets.find((wallet) => wallet.chain === 'EVM' && wallet.key === 'zerodev');

            // get oauth data
            const oauthData = user?.verifiedCredentials?.find((credential: any) => credential.format === 'oauth');

            // set primary wallet
            // if (evmWallet) {
            //   await wallets.setPrimary({ walletId: evmWallet?.id });
            // }

            await createProfile({
              email: user?.email ?? '',
              display_name: oauthData?.oauthDisplayName ?? user?.email,
              description: '',
              logo_url: oauthData?.oauthAccountPhotos?.[0] ?? '',
              default_currency: defaultCurrency.code,
              default_language: language ?? 'en',
              default_token_id: defaultToken?.key,
              // wallet_address: evmWallet?.address ?? '',
            });
          }

          setToken(auth.token);
          showToast({
            type: 'success',
            message: 'Welcome to Rozo POS',
          });
          setIsAuthLoading(false);
          // Fetch profile data after successful login
          fetchProfile();
          router.navigate('/');
        }
      } catch (error: any) {
        // Handle error directly here
        showToast({
          type: 'danger',
          message: error?.message ?? 'Failed to create profile',
        });
        setIsAuthLoading(false);
      }
    },
    [createProfile, userWallets, auth.token, router]
  );

  // No longer need separate useEffects for profile creation success/error
  // as we're handling them directly in the createMerchantProfile function

  // Define event handlers outside of useEffect
  const authInitHandler = useCallback(() => {
    console.log('init');
    setIsAuthLoading(true);
  }, []);

  const authSuccessHandler = useCallback(
    (user: any) => {
      setIsAuthLoading(true);

      if (user) {
        createMerchantProfile(user);
      } else {
        showToast({
          type: 'danger',
          message: 'Failed to login',
        });
        setIsAuthLoading(false);
      }
    },
    [createMerchantProfile]
  );

  const authFailedHandler = useCallback(() => {
    showToast({
      type: 'danger',
      message: 'Authentication failed',
    });
    setIsAuthLoading(false);
  }, []);

  // Register event listeners
  auth.on('authInit', authInitHandler);
  auth.on('authSuccess', authSuccessHandler);
  auth.on('authFailed', authFailedHandler);
  sdk.on('loadedChanged', (loaded: boolean) => {
    if (loaded) {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  });

  const contextPayload = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      merchant,
      defaultCurrency,
      merchantToken,
      wallets: userWallets,
      primaryWallet,
      isAuthLoading,
      showAuthModal,
      setToken,
      setMerchant: handleSetMerchant,
      logout,
    }),
    [token, merchant, userWallets, primaryWallet, isAuthLoading, showAuthModal, handleSetMerchant]
  );

  return <AppContext.Provider value={contextPayload}>{isLoading ? <PageLoader /> : children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
