import { getRevenueCatConfig } from '@/constants/revenuecat';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';

type PackageItem = {
  identifier: string;
  packageType?: string;
  product: {
    title?: string;
    description?: string;
    priceString?: string;
    subscriptionPeriod?: string;
  };
};

export default function SubscriptionPlansScreen() {
  const { t } = useTranslation();
  const [monthlyPlan, setMonthlyPlan] = useState<PackageItem | null>(null);
  const [annualPlan, setAnnualPlan] = useState<PackageItem | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const getRevenueCatErrorMessage = (error: unknown) => {
    const err = error as any;
    const code = err?.code ? String(err.code) : '';
    const message = err?.message ? String(err.message) : t('subscriptionPlans.loadingUnknownError');
    return code ? `${message} (${code})` : message;
  };

  const configureRevenueCatIfNeeded = async () => {
    try {
      const purchasesAny = Purchases as any;
      if (typeof purchasesAny.isConfigured === 'function') {
        const configured = await purchasesAny.isConfigured();
        if (configured) return;
      }

      const { appEnv, selectedApiKey, expectedKeyLabel } = getRevenueCatConfig();

      if (!selectedApiKey) {
        throw new Error(t('subscriptionPlans.missingApiKey', { appEnv, expectedKeyLabel }));
      }

      Purchases.configure({ apiKey: selectedApiKey });
      console.log('[RevenueCat][subscription_plans] SDK configurado localmente para evitar condición de carrera.');
    } catch (error: any) {
      const errorMessage = String(error?.message ?? '').toLowerCase();
      if (
        errorMessage.includes('already configured') ||
        errorMessage.includes('already configured instance')
      ) {
        return;
      }

      throw error;
    }
  };

  const fetchOfferingsWithRetry = async () => {
    try {
      return await Purchases.getOfferings();
    } catch (firstError: any) {
      const firstMessage = String(firstError?.message ?? '').toLowerCase();
      const isPotentialInitRace = firstMessage.includes('configure') || firstMessage.includes('singleton');

      if (!isPotentialInitRace) {
        throw firstError;
      }

      await new Promise((resolve) => setTimeout(resolve, 450));
      return await Purchases.getOfferings();
    }
  };

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setLoadError('');

      await configureRevenueCatIfNeeded();

      const offerings = await fetchOfferingsWithRetry();
      const currentOffering = offerings.current;
      const currentPackages = (currentOffering?.availablePackages ?? []) as PackageItem[];

      if (!currentOffering) {
        setMonthlyPlan(null);
        setAnnualPlan(null);
        setLoadError(t('subscriptionPlans.noOffering'));
        return;
      }

      if (currentPackages.length === 0) {
        setMonthlyPlan(null);
        setAnnualPlan(null);
        setLoadError(t('subscriptionPlans.noPlansForBuild'));
        return;
      }

      const monthly = currentPackages.find((item) => {
        const packageType = String(item.packageType ?? '').toUpperCase();
        const period = String(item.product?.subscriptionPeriod ?? '').toUpperCase();
        const title = String(item.product?.title ?? '').toLowerCase();
        const identifier = String(item.identifier ?? '').toLowerCase();

        return (
          packageType === 'MONTHLY' ||
          period.includes('P1M') ||
          title.includes('mes') ||
          title.includes('monthly') ||
          identifier.includes('month') ||
          identifier.includes('mensual')
        );
      });

      const annual = currentPackages.find((item) => {
        const packageType = String(item.packageType ?? '').toUpperCase();
        const period = String(item.product?.subscriptionPeriod ?? '').toUpperCase();
        const title = String(item.product?.title ?? '').toLowerCase();
        const identifier = String(item.identifier ?? '').toLowerCase();

        return (
          packageType === 'ANNUAL' ||
          period.includes('P1Y') ||
          title.includes('anual') ||
          title.includes('annual') ||
          identifier.includes('year') ||
          identifier.includes('anual')
        );
      });

      setMonthlyPlan(monthly ?? null);
      setAnnualPlan(annual ?? null);
    } catch (error) {
      setMonthlyPlan(null);
      setAnnualPlan(null);
      const detailedError = getRevenueCatErrorMessage(error);
      setLoadError(t('subscriptionPlans.loadPlansError', { detail: detailedError }));
      console.log('[RevenueCat][subscription_plans] getOfferings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>{t('subscriptionPlans.title')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>{t('subscriptionPlans.cardTitle')}</Text>

          {!!loadError && <Text style={styles.errorText}>{loadError}</Text>}
          {!!loadError && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadPlans}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.retryText}>{isLoading ? t('common.loading') : t('subscriptionPlans.retry')}</Text>
            </TouchableOpacity>
          )}

          {monthlyPlan ? (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>{t('subscriptionPlans.monthlyTitle')}</Text>
              <Text style={styles.planDescription}>
                {monthlyPlan?.product?.description ?? t('subscriptionPlans.monthlyDuration')}
              </Text>
              <Text style={styles.planDescription}>{t('subscriptionPlans.monthlyDuration')}</Text>
              <Text style={styles.planPrice}>{monthlyPlan?.product?.priceString ?? '-'}</Text>
            </View>
          ) : (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>{t('subscriptionPlans.monthlyTitle')}</Text>
              <Text style={styles.planDescription}>{t('subscriptionPlans.monthlyDuration')}</Text>
              <Text style={styles.planDescription}>{t('subscriptionPlans.notAvailable')}</Text>
            </View>
          )}

          {annualPlan ? (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>{t('subscriptionPlans.annualTitle')}</Text>
              <Text style={styles.planDescription}>
                {annualPlan?.product?.description ?? t('subscriptionPlans.annualDuration')}
              </Text>
              <Text style={styles.planDescription}>{t('subscriptionPlans.annualDuration')}</Text>
              <Text style={styles.planPrice}>{annualPlan?.product?.priceString ?? '-'}</Text>
            </View>
          ) : (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>{t('subscriptionPlans.annualTitle')}</Text>
              <Text style={styles.planDescription}>{t('subscriptionPlans.annualDuration')}</Text>
              <Text style={styles.planDescription}>{t('subscriptionPlans.notAvailable')}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A18',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerAccent: {
    width: 6,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#8B5CF6',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#0F1733',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6D42D8',
    padding: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 14,
    gap: 16,
  },
  cardEyebrow: {
    color: '#9BA3B2',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF5C7A',
    fontSize: 13,
    fontWeight: '600',
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  retryText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  planCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(10, 16, 38, 0.7)',
    padding: 16,
    gap: 6,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  planDescription: {
    color: '#B3C0D9',
    fontSize: 13,
    fontWeight: '500',
  },
  planPrice: {
    color: '#C4B5FD',
    fontSize: 14,
    fontWeight: '700',
  },
});
