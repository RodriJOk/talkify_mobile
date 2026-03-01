import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  const iosBundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.rodrigojuarez.talkifymobile';

  return {
    ...config,
    name: config.name ?? 'talkify_mobile',
    slug: config.slug ?? 'talkify_mobile',
    ios: {
      ...(config.ios ?? {}),
      bundleIdentifier: iosBundleIdentifier,
    },
    extra: {
      ...(config.extra ?? {}),
      appEnv,
      eas: {
        ...(config.extra?.eas ?? {}),
        projectId: '9ef103d4-5791-4b9d-ad51-36ab8f80e1d4',
      },
    },
  };
};
