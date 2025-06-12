import React from 'react';

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
import { useSelectedLanguage } from '@/modules/i18n';
import { type Language } from '@/modules/i18n/resources';
import { useApp } from '@/providers/app.provider';
import { useCreateProfile } from '@/resources/api';

export const languages = [
  {
    label: 'Arabic (العربية)',
    key: 'ar',
    flag: '🇸🇦',
  },
  {
    label: 'Bengali (বাংলা)',
    key: 'bn',
    flag: '🇧🇩',
  },
  {
    label: 'Chinese (中文)',
    key: 'zh',
    flag: '🇨🇳',
  },
  {
    label: 'English (English)',
    key: 'en',
    flag: '🇺🇸',
  },
  {
    label: 'French (Français)',
    key: 'fr',
    flag: '🇫🇷',
  },
  {
    label: 'Hindi (हिन्दी)',
    key: 'hi',
    flag: '🇮🇳',
  },
  {
    label: 'Indonesian (Bahasa Indonesia)',
    key: 'id',
    flag: '🇮🇩',
  },
  {
    label: 'Portuguese (Português)',
    key: 'pt',
    flag: '🇵🇹',
  },
  {
    label: 'Russian (Русский)',
    key: 'ru',
    flag: '🇷🇺',
  },
  {
    label: 'Spanish (Español)',
    key: 'es',
    flag: '🇪🇸',
  },
];

export function ActionSheetLanguageSwitcher({ trigger }: { trigger: (lg: string) => React.ReactNode }) {
  const { language, setLanguage } = useSelectedLanguage();
  const [selectedValue, setSelectedValue] = React.useState<Language>(language);

  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const handleClose = () => setShowActionsheet(false);

  const itemRefs = React.useRef<{ [key: string]: React.RefObject<any> }>({});

  const { mutateAsync: createProfile, data } = useCreateProfile();
  const { merchant, setMerchant } = useApp();

  React.useEffect(() => {
    languages.forEach((lg) => {
      if (!itemRefs.current[lg.key]) {
        itemRefs.current[lg.key] = React.createRef();
      }
    });
  }, []);

  React.useEffect(() => {
    if (merchant && merchant.default_language) {
      const lg = merchant.default_language.toLowerCase() as Language;
      setSelectedValue(lg);
    }
  }, [merchant]);

  React.useEffect(() => {
    setMerchant(data);
  }, [data]);

  const initialLabel = React.useMemo(() => {
    const lg = languages.find((lg) => lg.key === language);

    if (lg) {
      return `${lg.flag} ${lg.label}`;
    }

    return '-';
  }, [language]);

  const selectedLabel = React.useMemo(() => {
    const lg = languages.find((lg) => lg.key === language);

    if (lg) {
      return `${lg.flag} ${lg.label}`;
    }

    return '-';
  }, [selectedValue]);

  const initialFocusRef = React.useMemo(() => {
    return itemRefs.current[selectedValue] || itemRefs.current[language];
  }, [selectedValue, language]);

  function handleLanguageChange(value: Language) {
    if (!merchant?.email) return;

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { created_at, ...rest } = merchant;
    createProfile({
      ...rest,
      default_language: value.toUpperCase(),
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
            return (
              <ActionsheetItem
                key={lg.key}
                ref={itemRefs.current[lg.key]}
                onPress={() => handleLanguageChange(lg.key as Language)}
              >
                <ActionsheetItemText>{`${lg.flag} ${lg.label}`}</ActionsheetItemText>
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
