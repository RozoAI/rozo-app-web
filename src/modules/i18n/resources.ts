import en from '@/translations/en.json';
import id from '@/translations/id.json';

export const resources = {
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
  ar: {
    translation: en,
  },
  bn: {
    translation: en,
  },
  zh: {
    translation: en,
  },
  fr: {
    translation: en,
  },
  hi: {
    translation: en,
  },
  ru: {
    translation: en,
  },
  es: {
    translation: en,
  },
};

export type Language = keyof typeof resources;
