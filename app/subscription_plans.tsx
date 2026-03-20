import { getRevenueCatConfig } from '@/constants/revenuecat';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';

type PackageItem = {
  identifier: string;
  packageType?: string;
  product: {
    identifier?: string;
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
  const [diagnosticLines, setDiagnosticLines] = useState<string[]>([]);

  const buildPackageDiagnosticLine = (item: PackageItem, index: number) => {
    const packageType = String(item.packageType ?? '-').toUpperCase();
    const productId = String(item.product?.identifier ?? '-');
    const period = String(item.product?.subscriptionPeriod ?? '-').toUpperCase();
    const price = String(item.product?.priceString ?? '-');
    return `#${index + 1} pkg=${item.identifier} | type=${packageType} | product=${productId} | period=${period} | price=${price}`;
  };

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
      console.log('[RevenueCat][subscription_plans] SDK configurado localmente.');
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
      setDiagnosticLines([]);

      await configureRevenueCatIfNeeded();

      const offerings = await fetchOfferingsWithRetry();
      const currentOffering = offerings.current;
      const currentPackages = (currentOffering?.availablePackages ?? []) as PackageItem[];

      const lines = [
        `[RC] currentOffering=${String(currentOffering?.identifier ?? 'null')}`,
        `[RC] availablePackages=${String(currentPackages.length)}`,
        ...currentPackages.map((item, index) => buildPackageDiagnosticLine(item, index)),
      ];
      setDiagnosticLines(lines);
      console.log('[RevenueCat][subscription_plans] Diagnostics start');
      lines.forEach((line) => console.log(line));
      console.log('[RevenueCat][subscription_plans] Diagnostics end');

      if (!currentOffering) {
        setMonthlyPlan(null);
        setAnnualPlan(null);
        setLoadError(t('subscriptionPlans.noOffering'));
        return;
      }

      const monthly = currentPackages.find((item) => {
        const packageType = String(item.packageType ?? '').toUpperCase();
        const period = String(item.product?.subscriptionPeriod ?? '').toUpperCase();
        return (
          packageType === 'MONTHLY' ||
          period.includes('P1M') ||
          item.identifier.toLowerCase().includes('month')
        );
      });

      const annual = currentPackages.find((item) => {
        const packageType = String(item.packageType ?? '').toUpperCase();
        const period = String(item.product?.subscriptionPeriod ?? '').toUpperCase();
        return (
          packageType === 'ANNUAL' ||
          period.includes('P1Y') ||
          item.identifier.toLowerCase().includes('year')
        );
      });

      setMonthlyPlan(monthly ?? null);
      setAnnualPlan(annual ?? null);

      console.log(
        '[RevenueCat][subscription_plans] Match summary:',
        JSON.stringify(
          {
            monthly: monthly
              ? {
                  packageIdentifier: monthly.identifier,
                  packageType: monthly.packageType ?? null,
                  productId: monthly.product?.identifier ?? null,
                  period: monthly.product?.subscriptionPeriod ?? null,
                  price: monthly.product?.priceString ?? null,
                }
              : null,
            annual: annual
              ? {
                  packageIdentifier: annual.identifier,
                  packageType: annual.packageType ?? null,
                  productId: annual.product?.identifier ?? null,
                  period: annual.product?.subscriptionPeriod ?? null,
                  price: annual.product?.priceString ?? null,
                }
              : null,
          },
          null,
          2
        )
      );
    } catch (error) {
      setMonthlyPlan(null);
      setAnnualPlan(null);
      const detailedError = getRevenueCatErrorMessage(error);
      setLoadError(t('subscriptionPlans.loadPlansError', { detail: detailedError }));
      console.error('[RevenueCat][subscription_plans] loadPlans error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Función para abrir enlaces legales
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>{t('subscriptionPlans.title')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>{t('subscriptionPlans.cardTitle')}</Text>

          {!!loadError && <Text style={styles.errorText}>{loadError}</Text>}

          {diagnosticLines.length > 0 && (
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>Diagnostics</Text>
              {diagnosticLines.map((line) => (
                <Text key={line} style={styles.debugLine}>{line}</Text>
              ))}
            </View>
          )}
          
          {/* Plan Mensual */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>{t('subscriptionPlans.monthlyTitle')}</Text>
            <Text style={styles.planDescription}>
              {monthlyPlan?.product?.description ?? t('subscriptionPlans.monthlyDuration')}
            </Text>
            <Text style={styles.planPrice}>
              {monthlyPlan ? monthlyPlan.product.priceString : t('subscriptionPlans.notAvailable')}
            </Text>
          </View>

          {/* Plan Anual */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>{t('subscriptionPlans.annualTitle')}</Text>
            <Text style={styles.planDescription}>
              {annualPlan?.product?.description ?? t('subscriptionPlans.annualDuration')}
            </Text>
            <Text style={styles.planPrice}>
              {annualPlan ? annualPlan.product.priceString : t('subscriptionPlans.notAvailable')}
            </Text>
          </View>
        </View>

        {/* --- SECCIÓN REQUERIDA POR APPLE (GUIDELINE 3.1.2) --- */}
        <View style={styles.legalSection}>
          <Text style={styles.legalDisclaimer}>
            {t('subscriptionPlans.legalDisclaimer', 'El pago se cargará a tu cuenta de iTunes al confirmar la compra. La suscripción se renueva automáticamente a menos que se cancele 24 horas antes del final del período actual.')}
          </Text>
          
          <View style={styles.legalLinksContainer}>
            <TouchableOpacity onPress={() => openLink('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
              <Text style={styles.legalLink}>{t('subscriptionPlans.termsOfUse', 'Terms of Use (EULA)')}</Text>
            </TouchableOpacity>
            
            <Text style={styles.legalDivider}>•</Text>
            
            <TouchableOpacity onPress={() => openLink('https://talkify.store/privacy_policy')}>
              <Text style={styles.legalLink}>{t('subscriptionPlans.privacyPolicy', 'Privacy Policy')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A18',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
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
    gap: 16,
    // Sombra para iOS
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    // Sombra para Android
    elevation: 14,
  },
  cardEyebrow: {
    color: '#9BA3B2',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorText: {
    color: '#FF5C7A',
    fontSize: 13,
    fontWeight: '600',
  },
  debugBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    padding: 12,
    gap: 6,
  },
  debugTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  debugLine: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
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
    marginTop: 4,
  },
  // --- Estilos Legales ---
  legalSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  legalDisclaimer: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  legalLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  legalLink: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalDivider: {
    color: '#64748B',
  },
});