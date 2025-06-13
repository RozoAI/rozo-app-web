import { CheckIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { View } from '@/components/ui/view';
import { showToast } from '@/lib';
import { useSelectedLanguage } from '@/modules/i18n';
import { type Language } from '@/modules/i18n/resources';
import { useApp } from '@/providers/app.provider';
import { useCreateProfile } from '@/resources/api';

// Define a display language type that's different from the actual Language type
type DisplayLanguageCode = string;

type LanguageOption = {
  label: string;
  key: DisplayLanguageCode;
  flag: string;
  value: Language; // The actual language value used in the app
};

export const languages: readonly LanguageOption[] = [
  {
    label: 'Arabic (العربية)',
    key: 'AR',
    flag: '🇸🇦',
    value: 'ar', // Fallback to English if Arabic is not available
  },
  {
    label: 'Bengali (বাংলা)',
    key: 'BN',
    flag: '🇧🇩',
    value: 'bn', // Fallback to English if Bengali is not available
  },
  {
    label: 'Chinese (中文)',
    key: 'ZH',
    flag: '🇨🇳',
    value: 'zh', // Fallback to English if Chinese is not available
  },
  {
    label: 'English (English)',
    key: 'EN',
    flag: '🇺🇸',
    value: 'en',
  },
  {
    label: 'French (Français)',
    key: 'FR',
    flag: '🇫🇷',
    value: 'fr', // Fallback to English if French is not available
  },
  {
    label: 'Hindi (हिन्दी)',
    key: 'HI',
    flag: '🇮🇳',
    value: 'hi', // Fallback to English if Hindi is not available
  },
  {
    label: 'Indonesian (Bahasa Indonesia)',
    key: 'ID',
    flag: '🇮🇩',
    value: 'id',
  },
  {
    label: 'Portuguese (Português)',
    key: 'PT',
    flag: '🇵🇹',
    value: 'en', // Fallback to English if Portuguese is not available
  },
  {
    label: 'Russian (Русский)',
    key: 'RU',
    flag: '🇷🇺',
    value: 'ru', // Fallback to English if Russian is not available
  },
  {
    label: 'Spanish (Español)',
    key: 'ES',
    flag: '🇪🇸',
    value: 'es', // Fallback to English if Spanish is not available
  },
] as const;

type ActionSheetLanguageSwitcherProps = {
  trigger: (lg: string) => React.ReactNode;
};

export function ActionSheetLanguageSwitcher({ trigger }: ActionSheetLanguageSwitcherProps): React.ReactElement {
  const { language, setLanguage } = useSelectedLanguage();
  // Find the display language code based on the current language
  const findDisplayLanguage = (lang: Language): DisplayLanguageCode => {
    const found = languages.find((lg) => lg.value === lang);
    return found ? found.key : 'EN';
  };

  const [selectedValue, setSelectedValue] = useState<DisplayLanguageCode>(findDisplayLanguage(language || 'en'));
  const [showActionsheet, setShowActionsheet] = useState<boolean>(false);

  const { mutateAsync: createProfile, data, isPending, error } = useCreateProfile();
  const { merchant, setMerchant } = useApp();

  // Create refs once and store them
  const itemRefs = useRef<Record<string, React.RefObject<any>>>({});

  // Initialize refs only once
  useEffect(() => {
    languages.forEach((lg) => {
      if (!itemRefs.current[lg.key]) {
        itemRefs.current[lg.key] = React.createRef();
      }
    });
  }, []);

  // Update selected value when merchant data changes
  useEffect(() => {
    if (merchant?.default_language) {
      // Convert the merchant's language to our display language code
      const displayLang =
        languages.find((lg) => lg.value === (merchant.default_language.toLowerCase() as Language))?.key || 'EN';
      setSelectedValue(displayLang);
    }
  }, [merchant?.default_language]);

  // Handle API response
  useEffect(() => {
    if (data) {
      setMerchant(data);
      // Find the corresponding language value for the display language code
      const languageValue = languages.find((lg) => lg.key === data.default_language.toUpperCase())?.value || 'en';
      showToast({
        message: 'Language updated successfully',
        type: 'success',
      });

      setLanguage(languageValue);
    } else if (error) {
      showToast({
        message: 'Failed to update language',
        type: 'danger',
      });
    }
  }, [data, error]);

  // Memoized values
  const initialLabel = useMemo(() => {
    // Find display language that matches the current language value
    const lg = languages.find((lg) => lg.value === language);
    return lg ? `${lg.flag} ${lg.label}` : '-';
  }, [language]);

  const selectedLabel = useMemo(() => {
    const lg = languages.find((lg) => lg.key === selectedValue);
    return lg ? `${lg.flag} ${lg.label}` : '-';
  }, [selectedValue]);

  const initialFocusRef = useMemo(() => {
    // Use the display language code for the ref
    const displayLanguage = findDisplayLanguage(language || 'en');
    return itemRefs.current[selectedValue] || itemRefs.current[displayLanguage];
  }, [selectedValue, language, findDisplayLanguage]);

  // Callbacks
  const handleClose = useCallback(() => setShowActionsheet(false), []);
  const handleOpen = useCallback(() => setShowActionsheet(true), []);

  const handleLanguageChange = useCallback(
    (displayCode: DisplayLanguageCode) => {
      if (!merchant?.email) return;

      // Find the language option that matches the display code
      const languageOption = languages.find((lg) => lg.key === displayCode);
      if (!languageOption) return;

      // eslint-disable-next-line unused-imports/no-unused-vars
      const { created_at, ...rest } = merchant;
      createProfile({
        ...rest,
        default_language: displayCode,
      });

      handleClose();
    },
    [createProfile, handleClose, merchant]
  );

  // Memoized language item renderer
  const renderLanguageItem = useCallback(
    (lg: LanguageOption) => {
      const isActive = lg.key === selectedValue;
      return (
        <ActionsheetItem
          key={lg.key}
          ref={itemRefs.current[lg.key]}
          onPress={() => handleLanguageChange(lg.key)}
          data-active={isActive}
        >
          <ActionsheetItemText className="flex w-full items-center justify-between">
            {`${lg.flag} ${lg.label}`}
            {isActive && <CheckIcon />}
          </ActionsheetItemText>
        </ActionsheetItem>
      );
    },
    [selectedValue, handleLanguageChange]
  );

  return (
    <>
      <Pressable onPress={handleOpen} className="relative w-full">
        {trigger(selectedLabel ?? initialLabel)}
        {isPending && (
          <View className="absolute inset-x-0 top-0 z-10 flex size-full items-center justify-center bg-white/50 py-2">
            <Spinner />
          </View>
        )}
      </Pressable>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose} trapFocus={false} initialFocusRef={initialFocusRef}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {languages.map(renderLanguageItem)}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
