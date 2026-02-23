import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';

const pickerOptionColor = Platform.OS === 'android' ? '#111111' : '#FFFFFF';
const pickerPlaceholderColor = Platform.OS === 'android' ? '#6B7280' : '#8EA0C1';

type PackageItem = {
  identifier: string;
  product: {
    title?: string;
    description?: string;
    priceString?: string;
  };
};

export default function SubscriptionPlansScreen() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const currentPackages = (offerings.current?.availablePackages ?? []) as PackageItem[];
        setPackages(currentPackages);
        if (currentPackages.length > 0) {
          setSelectedPlan(String(currentPackages[0].identifier));
        }
      } catch (error) {
        setPackages([]);
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
          <Text style={styles.cardEyebrow}>SELECCIONA UN PLAN</Text>

          <View style={styles.selectField}>
            <Picker
              selectedValue={selectedPlan}
              onValueChange={(value) => setSelectedPlan(String(value))}
              style={styles.picker}
              dropdownIconColor="#FFFFFF"
              mode="dropdown"
            >
              <Picker.Item label="Selecciona un plan" value="" color={pickerPlaceholderColor} />
              {packages.map((item) => {
                const title = item?.product?.title ?? 'Plan';
                const price = item?.product?.priceString ?? '';
                const label = price ? `${title} (${price})` : title;
                return (
                  <Picker.Item
                    key={String(item.identifier)}
                    label={label}
                    value={String(item.identifier)}
                    color={pickerOptionColor}
                  />
                );
              })}
            </Picker>
          </View>

          {packages.map((item) => {
            const title = item?.product?.title ?? 'Plan';
            const description = item?.product?.description ?? 'Sin descripcion.';
            const price = item?.product?.priceString ?? '';
            return (
              <View key={item.identifier} style={styles.planCard}>
                <Text style={styles.planTitle}>{title}</Text>
                <Text style={styles.planDescription}>{description}</Text>
                <Text style={styles.planPrice}>{price}</Text>
              </View>
            );
          })}
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
  selectField: {
    minHeight: 44,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6D42D8',
    backgroundColor: '#0A1026',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  picker: {
    color: '#FFFFFF',
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
