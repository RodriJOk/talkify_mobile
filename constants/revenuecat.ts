import { Platform } from 'react-native';

type RevenueCatEnv = 'development' | 'preview' | 'production';

type RevenueCatConfig = {
  appEnv: RevenueCatEnv;
  isProduction: boolean;
  selectedApiKey: string;
  expectedKeyLabel: string;
};

const DEFAULT_KEYS = {
  ios: {
    test: 'test_iwbkorYVRAiCefjPvnARnkNYeFY',
    prod: 'appl_mTpdbKsVxQhYewwMFpifOTIjhKO',
  },
  android: {
    test: 'test_iwbkorYVRAiCefjPvnARnkNYeFY',
    prod: 'goog_BZzTuGaPdPVkvCZUpkXNyYPIeHd',
  },
};

export function getRevenueCatConfig(): RevenueCatConfig {
  const rawEnv = String(process.env.EXPO_PUBLIC_APP_ENV ?? 'development').toLowerCase();
  const appEnv: RevenueCatEnv = rawEnv === 'production' ? 'production' : rawEnv === 'preview' ? 'preview' : 'development';

  const isProduction = appEnv === 'production';
  const isIOS = Platform.OS === 'ios';

  const envKey = isProduction ? 'PROD' : 'TEST';

  const selectedApiKey = isIOS
    ? String(
        isProduction
          ? process.env.EXPO_PUBLIC_RC_IOS_PROD_KEY ?? DEFAULT_KEYS.ios.prod
          : process.env.EXPO_PUBLIC_RC_IOS_TEST_KEY ?? DEFAULT_KEYS.ios.test
      )
    : String(
        isProduction
          ? process.env.EXPO_PUBLIC_RC_ANDROID_PROD_KEY ?? DEFAULT_KEYS.android.prod
          : process.env.EXPO_PUBLIC_RC_ANDROID_TEST_KEY ?? DEFAULT_KEYS.android.test
      );

  return {
    appEnv,
    isProduction,
    selectedApiKey,
    expectedKeyLabel: `EXPO_PUBLIC_RC_${isIOS ? 'IOS' : 'ANDROID'}_${envKey}_KEY`,
  };
}

export function hasKnownRevenueCatKeyPrefix(key: string): boolean {
  return key.startsWith('appl_') || key.startsWith('goog_') || key.startsWith('test_');
}
