import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://talkify.store/api';

type BackendSubscription = {
  id: number;
  name: string;
  type: string;
  state: string;
  payment_id: string;
  user_id: number;
  start_date: string;
  end_date: string;
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState('');
  const pickerOptionColor = Platform.OS === 'android' ? '#111111' : '#FFFFFF';
  const pickerPlaceholderColor = Platform.OS === 'android' ? '#6B7280' : '#8EA0C1';
  const [packages, setPackages] = useState<any[]>([]);
  const [activeEntitlement, setActiveEntitlement] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [backendSubscription, setBackendSubscription] = useState<BackendSubscription | null>(null);
  const [backendStatusLoading, setBackendStatusLoading] = useState(true);
  const [backendStatusError, setBackendStatusError] = useState('');

  useEffect(() => {
    const loadRevenueCatData = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const offerings = await Purchases.getOfferings();
        const currentPackages = offerings.current?.availablePackages ?? [];
        setPackages(currentPackages);

        if (!plan && currentPackages.length > 0) {
          setPlan(String(currentPackages[0].identifier));
        }

        const customerInfo = await Purchases.getCustomerInfo();
        const activeKeys = Object.keys(customerInfo.entitlements.active ?? {});
        const entitlementId = activeKeys.length > 0 ? activeKeys[0] : null;
        setActiveEntitlement(entitlementId);
        setActiveProductId(
          entitlementId ? customerInfo.entitlements.active[entitlementId]?.productIdentifier ?? null : null
        );
      } catch (error) {
        setLoadError('No se pudo cargar la informacion de suscripcion.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRevenueCatData();
  }, []);

  useEffect(() => {
    const loadBackendStatus = async () => {
      try {
        setBackendStatusLoading(true);
        setBackendStatusError('');

        const [storedUserId, storedToken, storedUserInfo] = await Promise.all([
          AsyncStorage.getItem('user_id'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user_information'),
        ]);

        const parsedUser = storedUserInfo ? JSON.parse(storedUserInfo) : null;
        const resolvedUserId = String(storedUserId || parsedUser?.id || '').trim();

        if (!resolvedUserId) {
          setBackendStatusError('No se pudo obtener el usuario.');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/subscription_status/${resolvedUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
          },
        });

        const data = await response.json();
        console.log('Respuesta del backend para estado de suscripción:', data);
        if (!response.ok) {
          throw new Error(data?.message || 'No se pudo cargar el estado de suscripcion.');
        }

        setBackendSubscription(data?.subscription ?? null);
      } catch (error) {
        setBackendStatusError('No se pudo cargar el estado de suscripcion.');
      } finally {
        setBackendStatusLoading(false);
      }
    };

    loadBackendStatus();
  }, []);

  const selectedPackage = useMemo(
    () => packages.find((item) => String(item.identifier) === String(plan)),
    [packages, plan]
  );

  const isSubscriptionActive = useMemo(() => {
    if (backendSubscription) {
      return backendSubscription.state === 'active';
    }
    return Boolean(activeEntitlement);
  }, [activeEntitlement, backendSubscription]);

  const statusLabel = useMemo(() => {
    if (backendStatusLoading || isLoading) return 'CARGANDO ESTADO...';
    if (backendStatusError || loadError) return 'NO SE PUDO CARGAR EL ESTADO';
    if (backendSubscription) {
      return backendSubscription.state === 'active'
        ? 'SUSCRIPCION ACTIVA'
        : 'NO TIENES UNA SUSCRIPCION ACTIVA';
    }
    if (activeEntitlement) return 'SUSCRIPCION ACTIVA';
    return 'NO TIENES UNA SUSCRIPCION ACTIVA';
  }, [
    activeEntitlement,
    backendStatusError,
    backendStatusLoading,
    backendSubscription,
    isLoading,
    loadError,
  ]);

  const statusDetail = useMemo(() => {
    console.log('Calculando statusDetail con:', {
      activeEntitlement,
      activeProductId,
      backendSubscription,
    });
    if (backendSubscription) {
      const endDate = backendSubscription.end_date || '';
      return endDate ? `Caduca: ${endDate}` : backendSubscription.name;
    }
    if (!activeEntitlement) return '';
    return activeProductId ?? activeEntitlement;
  }, [activeEntitlement, activeProductId, backendSubscription]);

  const registerSubscriptionInBackend = async (purchaseResult: any, selectedPackage: any, entitlementId: string | null) => {
    console.log('=== REGISTRANDO SUSCRIPCIÓN EN BACKEND ===');
    // console.log('purchaseResult:', JSON.stringify(purchaseResult, null, 2));
    // console.log('selectedPackage:', JSON.stringify(selectedPackage, null, 2));
    // console.log('entitlementId:', entitlementId);
    // console.log('API_BASE_URL:', API_BASE_URL);
    // console.log('=========================================');

    try {
      console.log('------------ OBTENIENDO DATOS DE USUARIO PARA SUSCRIPCIÓN ------------');
      const userInfo = await AsyncStorage.getItem('user_information');
      const token = await AsyncStorage.getItem('token');

      if (!userInfo || !token) {
        console.log('⚠️ No hay información de usuario o token');
        Alert.alert('Error', 'No se pudo obtener la información del usuario.');
        return;
      }

      const session = JSON.parse(userInfo);
      const userId = session.id || null;
      console.log('User ID para suscripción:', userId);

      // Mapear el tipo de suscripción
      const subscriptionPeriod = selectedPackage?.product?.subscriptionPeriod || '';
      console.log('subscriptionPeriod del producto:', subscriptionPeriod);
      console.log('selectedPackage.packageType:', selectedPackage?.packageType);
      let subscriptionType = 'annual'; // por defecto
      
      if (subscriptionPeriod.includes('P1M') || selectedPackage?.packageType === 'MONTHLY') {
        subscriptionType = 'monthly';
      } else if (subscriptionPeriod.includes('P1Y') || selectedPackage?.packageType === 'ANNUAL') {
        subscriptionType = 'annual';
      }

      // Calcular fechas
      const now = new Date();
      const startDate = now.toISOString().split('T')[0];
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (subscriptionType === 'monthly' ? 30 : 365));
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Obtener transaction/payment ID de RevenueCat
      const latestTransaction = purchaseResult?.customerInfo?.nonSubscriptionTransactions?.[0] 
        || purchaseResult?.customerInfo?.activeSubscriptions?.[0];
      
      const paymentId = latestTransaction?.transactionIdentifier 
        || purchaseResult?.transaction?.transactionIdentifier 
        || Date.now(); // Fallback temporal

      const subscriptionData = {
        name: selectedPackage?.product?.title || 'Suscripción',
        type: subscriptionType,
        state: 'active',
        payment_id: String(paymentId),
        user_id: userId,
        start_date: startDate,
        end_date: formattedEndDate,
      };

      console.log({
        userId,
        subscriptionType,
        startDate,
        formattedEndDate,
        paymentId,
      });
      console.log('📤 Datos a enviar al backend:', subscriptionData);

      const response = await fetch(`${API_BASE_URL}/renew_subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      const data = await response.json();
      console.log('📥 Respuesta del backend:', data);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Error al registrar la suscripción');
      }

      Alert.alert('¡Listo!', data?.message || 'Tu suscripción quedó activa.');
    } catch (error: any) {
      console.log('❌ Error al registrar en backend:', error);
      Alert.alert('Advertencia', 'La compra se realizó pero hubo un problema al registrarla: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handlePurchase = async () => {
    console.log('=== INICIO DE COMPRA ===');
    console.log('selectedPackage:', JSON.stringify(selectedPackage, null, 2));
    
    if (!selectedPackage) {
      console.log('ERROR: No hay paquete seleccionado');
      Alert.alert('Plan requerido', 'Selecciona un plan para continuar.');
      return;
    }

    try {
      console.log('Llamando a purchasePackage...');
      const purchaseResult = await Purchases.purchasePackage(selectedPackage);
      console.log('✅ Purchase result:', JSON.stringify(purchaseResult, null, 2));
      
      const customerInfo = purchaseResult.customerInfo ?? (await Purchases.getCustomerInfo());
      console.log('✅ Customer info after purchase:', JSON.stringify(customerInfo, null, 2));
      
      const activeKeys = Object.keys(customerInfo.entitlements.active ?? {});
      console.log('✅ Active entitlements:', activeKeys);
      
      const entitlementId = activeKeys.length > 0 ? activeKeys[0] : null;
      console.log('✅ Active entitlement ID:', entitlementId);
      
      setActiveEntitlement(entitlementId);
      setActiveProductId(
        entitlementId ? customerInfo.entitlements.active[entitlementId]?.productIdentifier ?? null : null
      );

      // Registrar la suscripción en el backend
      console.log('📤 Enviando suscripción al backend...');
      await registerSubscriptionInBackend(purchaseResult, selectedPackage, entitlementId);

    } catch (error: any) {
      console.log('❌ ERROR CAPTURADO:', error);
      console.log('❌ Error type:', typeof error);
      console.log('❌ Error keys:', Object.keys(error || {}));
      console.log('❌ userCancelled:', error?.userCancelled);
      console.log('❌ error.message:', error?.message);
      console.log('❌ error.code:', error?.code);
      
      if (error?.userCancelled) {
        console.log('Usuario canceló la compra');
        Alert.alert('Cancelado', 'Has cancelado la compra.');
        return;
      }
      
      const errorMessage = error?.message || error?.code || 'No se pudo completar la compra.';
      console.log('Purchase error completo:', JSON.stringify(error, null, 2));
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>ESTADO ACTUAL</Text>
          <View
            style={[
              styles.statusPill,
              isSubscriptionActive ? styles.statusPillActive : styles.statusPillInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isSubscriptionActive ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
          {!!statusDetail && <Text style={styles.statusDetail}>{statusDetail}</Text>}

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <View style={styles.selectField}>
              <Picker
                selectedValue={plan}
                onValueChange={(value) => setPlan(String(value))}
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

            <View style={styles.ctaGroup}>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.9}
                onPress={() => router.push('/subscription_plans')}
              >
                <Text style={styles.secondaryText}>Ver planes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ctaButton, (!selectedPackage || isLoading) && styles.ctaButtonDisabled]}
                activeOpacity={0.9}
                onPress={handlePurchase}
                disabled={!selectedPackage || isLoading}
              >
                <Text style={styles.ctaText}>Pagar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    minHeight: 200,
  },
  cardEyebrow: {
    color: '#9BA3B2',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  statusPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPillInactive: {
    backgroundColor: 'rgba(255, 79, 109, 0.18)',
  },
  statusPillActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statusTextInactive: {
    color: '#FF5C7A',
  },
  statusTextActive: {
    color: '#34D399',
  },
  statusDetail: {
    marginTop: 8,
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginTop: 18,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  footerRow: {
    marginTop: 18,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
    height: 100,
  },
  selectField: {
    flex: 1,
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
  ctaButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  ctaGroup: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    minHeight: 44,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#1A223F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
