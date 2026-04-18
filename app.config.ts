import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  const iosBundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.rodrigojuarez.talkifymobile';
  const androidAdMobAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? 'ca-app-pub-7684883612650628~7627804650';
  const iosAdMobAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ?? 'ca-app-pub-7684883612650628~8537015500';

  const plugins = [...(config.plugins ?? [])];
  const hasGoogleMobileAdsPlugin = plugins.some((plugin) => {
    if (typeof plugin === 'string') return plugin === 'react-native-google-mobile-ads';
    if (Array.isArray(plugin)) return plugin[0] === 'react-native-google-mobile-ads';
    return false;
  });

  if (!hasGoogleMobileAdsPlugin) {
    plugins.push([
      'react-native-google-mobile-ads',
      {
        androidAppId: androidAdMobAppId,
        iosAppId: iosAdMobAppId,
      },
    ]);
  } else {
    for (let i = 0; i < plugins.length; i += 1) {
      const plugin = plugins[i];

      if (Array.isArray(plugin) && plugin[0] === 'react-native-google-mobile-ads') {
        const pluginOptions = { ...(plugin[1] ?? {}) } as Record<string, unknown>;
        pluginOptions.androidAppId = androidAdMobAppId;
        pluginOptions.iosAppId = iosAdMobAppId;

        // Keep native installation enabled so RNGoogleMobileAdsModule is linked.
        delete pluginOptions.skipInstallation;

        plugins[i] = ['react-native-google-mobile-ads', pluginOptions];
      }
    }
  }

  return {
    ...config,
    name: config.name ?? 'Talkify',
    slug: config.slug ?? 'talkify_mobile',
    plugins,
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
