import en from '@/translations/en.json';
import id from '@/translations/id.json';

export const resources = {
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
};

export type Language = keyof typeof resources;
