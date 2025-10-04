import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useMemo } from 'react';
import { createContext, useEffect, useState } from 'react';

import { PageLoader } from '@/components/loader/loader';
import { type GenericWallet, useAuth } from '@/contexts/auth.context';
import { useSelectedLanguage } from '@/hooks/use-selected-language';
import { getItem, removeItem, setItem, showToast } from '@/lib';
import { MERCHANT_KEY, TOKEN_KEY } from '@/lib/constants';
import { currencies, type CurrencyConfig } from '@/lib/currencies';
import { AppError } from '@/lib/error';
import { defaultToken, type Token, tokens } from '@/lib/tokens';
import { useCreateProfile, useGetProfile } from '@/resources/api';
import { type MerchantProfile } from '@/resources/schema/merchant';

// Re-export GenericWallet type for backward compatibility
export type { GenericWallet };

interface IContextProps {
  isAuthenticated: boolean;
  token: string | undefined;
  merchant: MerchantProfile | undefined;
  defaultCurrency: CurrencyConfig | undefined;
  merchantToken: Token | undefined;
  wallets: GenericWallet[];
  primaryWallet: GenericWallet | null;
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

export const AppProvider: React.FC<IProviderProps> = ({ children }) => {
  const { refetch: fetchProfile, data: profileData, error: profileError } = useGetProfile();
  const { mutateAsync: createProfile } = useCreateProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false); // Track if we've fetched profile
  const router = useRouter();
  const { language } = useSelectedLanguage();

  const [merchant, setMerchant] = useState<MerchantProfile>();

  // Get auth state from the auth context
  const auth = useAuth();
  const { token, isAuthenticated, isAuthLoading, wallets, primaryWallet, showAuthModal, logout, user } = auth;

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

    // Store token for future use
    setItem(TOKEN_KEY, token);

    // If we have cached merchant data, use it immediately to speed up initial load
    if (cachedMerchant) {
      setMerchant(cachedMerchant);
      setIsLoading(false);
      // Profile fetching will be handled by the useEffect with hasFetchedProfile guard
    }
  };

  // Initialize app when token changes
  useEffect(() => {
    if (token) {
      initApp(token);
    }
  }, [token]);

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

  // Create merchant profile when user is authenticated but profile doesn't exist
  const handleCreateProfile = useCallback(async () => {
    if (!user || isCreatingProfile) return;

    try {
      setIsCreatingProfile(true);
      setIsLoading(true);

      console.log('Creating merchant profile for user:', user);

      // Extract user information for profile creation
      const email = user?.email?.address || user?.email || '';
      const displayName = user?.email?.address || user?.username || user?.id || 'User';
      const logoUrl = user?.image || user?.avatar || '';

      const profilePayload = {
        email,
        display_name: displayName,
        description: '',
        logo_url: logoUrl,
        default_currency: 'USD',
        default_language: (language ?? 'EN').toUpperCase(),
        default_token_id: defaultToken?.key,
      };

      console.log('Creating profile with payload:', profilePayload);

      const newProfile = await createProfile(profilePayload);

      if (newProfile) {
        handleSetMerchant(newProfile);
        showToast({
          type: 'success',
          message: 'Profile created successfully! Welcome to Rozo POS',
        });
      }
    } catch (error: any) {
      console.error('Failed to create merchant profile:', error);
      showToast({
        type: 'danger',
        message: error?.message || 'Failed to create profile',
      });
    } finally {
      setIsCreatingProfile(false);
      setIsLoading(false);
    }
  }, [user, isCreatingProfile, language, createProfile, handleSetMerchant]);

  // App-specific logout function that clears merchant data
  const appLogout = useCallback(async () => {
    try {
      setMerchant(undefined);
      // Clear merchant data from storage
      clearMerchantData();
      // Call the auth provider's logout
      await logout();
    } catch (_err) {
      showToast({
        type: 'danger',
        message: 'Failed to logout',
      });
    }
  }, [logout, clearMerchantData]);

  // Fetch merchant profile when token is available (only once)
  useEffect(() => {
    if (token && !hasFetchedProfile) {
      console.log('Fetching profile for the first time...');
      setIsLoading(true);
      setHasFetchedProfile(true); // Mark as fetched to prevent multiple calls
      fetchProfile();
    } else if (!token) {
      // Reset when token is cleared
      setHasFetchedProfile(false);
      setIsLoading(false);
    }
  }, [token, hasFetchedProfile, fetchProfile]);

  // Handle merchant profile data and errors
  useEffect(() => {
    if (profileData) {
      setIsLoading(false);
      // Update merchant data in state and storage
      handleSetMerchant(profileData);
    }

    if (profileError && profileError instanceof AppError) {
      // ✅ Handle 404 error - profile doesn't exist, create it
      if (profileError.statusCode === 404) {
        console.log('Profile not found (404), attempting to create profile...');
        handleCreateProfile();
      }
      // Handle other 4xx errors (except 404)
      else if (profileError.statusCode >= 400) {
        console.error('Profile fetch error:', profileError.statusCode, profileError.message);
        appLogout();
      }
      // Handle other errors
      else {
        showToast({
          type: 'danger',
          message: profileError?.message ?? 'Failed to get profile',
        });

        setIsLoading(false);
        router.replace('/error');
      }
    }
  }, [profileData, profileError, router, handleCreateProfile, appLogout]);

  const contextPayload = useMemo(
    () => ({
      isAuthenticated,
      token,
      merchant,
      defaultCurrency,
      merchantToken,
      wallets,
      primaryWallet,
      isAuthLoading: isAuthLoading || isCreatingProfile, // Include profile creation loading
      showAuthModal,
      setToken: () => {}, // Token is managed by auth provider now
      setMerchant: handleSetMerchant,
      logout: appLogout,
    }),
    [
      isAuthenticated,
      token,
      merchant,
      defaultCurrency,
      merchantToken,
      wallets,
      primaryWallet,
      isAuthLoading,
      isCreatingProfile,
      showAuthModal,
      handleSetMerchant,
      appLogout,
    ]
  );

  return (
    <AppContext.Provider value={contextPayload}>
      {isLoading ? <PageLoader merchant={merchant} /> : children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
