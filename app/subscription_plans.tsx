import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  const [monthlyPlan, setMonthlyPlan] = useState<PackageItem | null>(null);
  const [annualPlan, setAnnualPlan] = useState<PackageItem | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadError('');
        const offerings = await Purchases.getOfferings();
        const currentPackages = (offerings.current?.availablePackages ?? []) as PackageItem[];

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
        setLoadError('No se pudieron cargar los planes.');
      }
    };

    loadPlans();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>Planes disponibles</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>PLANES DISPONIBLES</Text>

          {!!loadError && <Text style={styles.errorText}>{loadError}</Text>}

          {monthlyPlan ? (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Plan mensual</Text>
              <Text style={styles.planDescription}>
                {monthlyPlan?.product?.description ?? 'Duración: 30 días.'}
              </Text>
              <Text style={styles.planDescription}>Duración: 30 días.</Text>
              <Text style={styles.planPrice}>{monthlyPlan?.product?.priceString ?? '-'}</Text>
            </View>
          ) : (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Plan mensual</Text>
              <Text style={styles.planDescription}>Duración: 30 días.</Text>
              <Text style={styles.planDescription}>No disponible por el momento.</Text>
            </View>
          )}

          {annualPlan ? (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Plan anual</Text>
              <Text style={styles.planDescription}>
                {annualPlan?.product?.description ?? 'Duración: 1 año.'}
              </Text>
              <Text style={styles.planDescription}>Duración: 1 año.</Text>
              <Text style={styles.planPrice}>{annualPlan?.product?.priceString ?? '-'}</Text>
            </View>
          ) : (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Plan anual</Text>
              <Text style={styles.planDescription}>Duración: 1 año.</Text>
              <Text style={styles.planDescription}>No disponible por el momento.</Text>
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
