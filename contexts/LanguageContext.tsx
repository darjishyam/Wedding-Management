import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  gujaratiNumerals,
  Language,
  setLanguage as setLanguageAction,
  translations
} from '../store/slices/languageSlice';

export function useLanguage() {
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.language.language);

  const setLanguage = (lang: Language) => {
    dispatch(setLanguageAction(lang));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.English] || key;
  };

  const convertNumerals = (value: string | number): string => {
    const str = value.toString();
    if (language !== "Gujrati") return str;
    return str.replace(/[0-9]/g, (d) => gujaratiNumerals[d]);
  };

  return {
    language,
    setLanguage,
    t,
    convertNumerals
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
