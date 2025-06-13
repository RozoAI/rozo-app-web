import { CheckIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/actionsheet';
import { Pressable } from '@/components/ui/pressable';
import { showToast } from '@/lib';
import { useSelectedLanguage } from '@/modules/i18n';
import { type Language } from '@/modules/i18n/resources';
import { useApp } from '@/providers/app.provider';
import { useCreateProfile } from '@/resources/api';

export const languages = [
  {
    label: 'Arabic (العربية)',
    key: 'AR',
    flag: '🇸🇦',
  },
  {
    label: 'Bengali (বাংলা)',
    key: 'BN',
    flag: '🇧🇩',
  },
  {
    label: 'Chinese (中文)',
    key: 'ZH',
    flag: '🇨🇳',
  },
  {
    label: 'English (English)',
    key: 'EN',
    flag: '🇺🇸',
  },
  {
    label: 'French (Français)',
    key: 'FR',
    flag: '🇫🇷',
  },
  {
    label: 'Hindi (हिन्दी)',
    key: 'HI',
    flag: '🇮🇳',
  },
  {
    label: 'Indonesian (Bahasa Indonesia)',
    key: 'ID',
    flag: '🇮🇩',
  },
  {
    label: 'Portuguese (Português)',
    key: 'PT',
    flag: '🇵🇹',
  },
  {
    label: 'Russian (Русский)',
    key: 'RU',
    flag: '🇷🇺',
  },
  {
    label: 'Spanish (Español)',
    key: 'ES',
    flag: '🇪🇸',
  },
];

export function ActionSheetLanguageSwitcher({ trigger }: { trigger: (lg: string) => React.ReactNode }) {
  const { language, setLanguage } = useSelectedLanguage();
  const [selectedValue, setSelectedValue] = useState<Language>(language ?? 'EN');

  const [showActionsheet, setShowActionsheet] = useState(false);
  const handleClose = () => setShowActionsheet(false);

  const itemRefs = React.useRef<{ [key: string]: React.RefObject<any> }>({});

  const { mutateAsync: createProfile, data } = useCreateProfile();
  const { merchant, setMerchant } = useApp();

  useEffect(() => {
    languages.forEach((lg) => {
      if (!itemRefs.current[lg.key]) {
        itemRefs.current[lg.key] = React.createRef();
      }
    });
  }, []);

  useEffect(() => {
    if (merchant && merchant.default_language) {
      const lg = merchant.default_language?.toUpperCase() as Language;
      setSelectedValue(lg);
    }
  }, [merchant]);

  useEffect(() => {
    if (data) {
      setMerchant(data);

      showToast({
        message: 'Language updated successfully',
        type: 'success',
      });
    }
  }, [data]);

  const initialLabel = useMemo(() => {
    const lg = languages.find((lg) => lg.key === language);

    if (lg) {
      return `${lg.flag} ${lg.label}`;
    }

    return '-';
  }, [language]);

  const selectedLabel = useMemo(() => {
    const lg = languages.find((lg) => lg.key === selectedValue);

    if (lg) {
      return `${lg.flag} ${lg.label}`;
    }

    return '-';
  }, [selectedValue]);

  const initialFocusRef = useMemo(() => {
    return itemRefs.current[selectedValue] || itemRefs.current[language];
  }, [selectedValue, language]);

  function handleLanguageChange(value: Language) {
    if (!merchant?.email) return;

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { created_at, ...rest } = merchant;
    createProfile({
      ...rest,
      default_language: value?.toUpperCase(),
    }).then(() => setLanguage(value));

    handleClose();
  }

  return (
    <>
      <Pressable onPress={() => setShowActionsheet(true)} className="w-full">
        {trigger(selectedLabel ?? initialLabel)}
      </Pressable>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose} trapFocus={false} initialFocusRef={initialFocusRef}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {languages.map((lg) => {
            const isActive = lg.key === selectedValue?.toUpperCase();

            return (
              <ActionsheetItem
                key={lg.key}
                ref={itemRefs.current[lg.key]}
                onPress={() => handleLanguageChange(lg.key as Language)}
                data-active={isActive}
              >
                <ActionsheetItemText className="flex w-full items-center justify-between">
                  {`${lg.flag} ${lg.label}`}
                  {isActive && <CheckIcon />}
                </ActionsheetItemText>
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
