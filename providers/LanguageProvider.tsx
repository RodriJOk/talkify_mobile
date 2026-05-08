import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import i18n from '@/i18n';
import { AppLanguage } from '@/i18n/resources';

const STORAGE_LANGUAGE_KEY = '@talkify/language';

type LanguageContextValue = {
  language: AppLanguage;
  isReady: boolean;
  setLanguage: (nextLanguage: AppLanguage) => Promise<void>;
};

const defaultContextValue: LanguageContextValue = {
  language: 'es',
  isReady: false,
  setLanguage: async () => {},
};

const LanguageContext = createContext<LanguageContextValue>(defaultContextValue);

const getInitialDeviceLanguage = (): AppLanguage => {
  const locale = getLocales()?.[0]?.languageCode?.toLowerCase();
  return locale === 'en' ? 'en' : 'es';
};

type Props = {
  children: ReactNode;
};

export function LanguageProvider({ children }: Props) {
  const [language, setLanguageState] = useState<AppLanguage>('es');
  const [isReady, setIsReady] = useState(false);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    await i18n.changeLanguage(nextLanguage);
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_LANGUAGE_KEY, nextLanguage);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(STORAGE_LANGUAGE_KEY);
        const validLanguages: AppLanguage[] = ['es', 'en', 'pt', 'de'];
        const initialLanguage: AppLanguage =
          validLanguages.includes(storedLanguage as AppLanguage)
            ? (storedLanguage as AppLanguage)
            : getInitialDeviceLanguage();

        await i18n.changeLanguage(initialLanguage);
        setLanguageState(initialLanguage);
      } catch (error) {
        const fallbackLanguage = getInitialDeviceLanguage();
        await i18n.changeLanguage(fallbackLanguage);
        setLanguageState(fallbackLanguage);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(() => ({ language, isReady, setLanguage }), [language, isReady, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}