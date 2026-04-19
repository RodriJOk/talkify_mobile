import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const PROD_INTERSTITIAL_IDS = {
  ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS_ID,
  android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_ID,
};

const PROD_BANNER_IDS = {
  ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS_ID,
  android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID_ID,
};

const PROD_REWARDED_IDS = {
  ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_ID,
  android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ID,
};

export const getInterstitialAdUnitId = () => {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }

  const productionId = Platform.OS === 'ios'
    ? PROD_INTERSTITIAL_IDS.ios
    : PROD_INTERSTITIAL_IDS.android;

  return productionId || TestIds.INTERSTITIAL;
};

export const getRewardedAdUnitId = () => {
  if (__DEV__) {
    return TestIds.REWARDED;
  }

  const productionId = Platform.OS === 'ios'
    ? PROD_REWARDED_IDS.ios
    : PROD_REWARDED_IDS.android;

  return productionId || TestIds.REWARDED;
};

export const getBannerAdUnitId = () => {
  if (__DEV__) {
    return TestIds.BANNER;
  }

  const productionId = Platform.OS === 'ios'
    ? PROD_BANNER_IDS.ios
    : PROD_BANNER_IDS.android;

  return productionId || TestIds.BANNER;
};
