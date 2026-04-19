import { buildAuthHeaders } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Modal, PanResponder, PanResponderGestureState, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});
const { width } = Dimensions.get('window');
// Ajustamos el tamaño para dar espacio a los brillos exteriores
const WHEEL_SIZE = width * 0.82; 
const RADIUS = WHEEL_SIZE / 2;
const API_BASE_URL = 'https://talkify.store/api';
const REWARDED_SPIN_BONUS_ENDPOINT = `${API_BASE_URL}/rewarded_rewarded_spin_bonus`;

const SEGMENT_COLORS = ['#9C27B0', '#E91E63', '#D32F2F', '#FFA000', '#673AB7'];

type RouletteCategory = {
  id: number;
  name: string;
};

type RouletteCard = {
  id: number;
  category_id: number;
  content: string;
};

type WheelSegment = {
  id: number;
  label: string;
  color: string;
};

type SpinDirection = 'clockwise' | 'counterclockwise';

type ResultModalState = {
  visible: boolean;
  category: string;
  content: string;
};

type SubscriptionStatus = {
  id: number;
  name: string;
  type: string;
  state: string;
  payment_id: string;
  user_id: number;
  start_date: string;
  end_date: string;
};

const WheelOfFortune = ({
  data,
  disabled,
  requireAuth,
  onRequireAuth,
  onFinished,
}: {
  data: WheelSegment[];
  disabled: boolean;
  requireAuth: boolean;
  onRequireAuth: () => void;
  onFinished: (value: WheelSegment) => void;
}) => {
  const rotation = useSharedValue(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const numberOfSegments = data.length;
  const anglePerSegment = numberOfSegments > 0 ? 360 / numberOfSegments : 0;
  const SPIN_DURATION = 4500;

  // Offset para que el primer segmento quede centrado arriba
  const visualOffset = -90 - anglePerSegment / 2;

  const spinWheel = (gestureBoost = 0, direction: SpinDirection = 'clockwise') => {
    if (isSpinning || numberOfSegments === 0) return;
    if (requireAuth) {
      onRequireAuth();
      return;
    }
    if (disabled) return;
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * numberOfSegments);
    const baseSpins = 10 + Math.floor(Math.random() * 5);
    const normalizedBoost = Math.max(0, Math.min(4, gestureBoost));
    const extraSpins = (baseSpins + normalizedBoost) * 360;
    
    // Cálculo matemático para centrar el segmento elegido bajo el puntero
    const targetAngle = randomIndex * anglePerSegment + anglePerSegment / 2;
    const targetRotation = 360 - targetAngle + Math.abs(visualOffset + 90); 
    
    const currentRotation = rotation.value % 360;
    const normalizedCurrent = ((currentRotation % 360) + 360) % 360;
    const normalizedTarget = ((targetRotation % 360) + 360) % 360;

    const clockwiseDelta = (() => {
      let delta = normalizedTarget - normalizedCurrent;
      if (delta < 0) delta += 360;
      return delta;
    })();

    const counterClockwiseDelta = (() => {
      let delta = normalizedCurrent - normalizedTarget;
      if (delta < 0) delta += 360;
      return delta;
    })();

    const totalRotation =
      direction === 'clockwise'
        ? rotation.value + extraSpins + clockwiseDelta
        : rotation.value - (extraSpins + counterClockwiseDelta);

    rotation.value = withTiming(totalRotation, {
      duration: SPIN_DURATION,
      easing: Easing.bezier(0.1, 0, 0.2, 1), // Curva de frenado más natural
    }, (finished) => {
      if (finished) {
        runOnJS(setIsSpinning)(false);
        runOnJS(onFinished)(data[randomIndex]);
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spinFromGesture = (gestureState: PanResponderGestureState) => {
    if (isSpinning || disabled || numberOfSegments === 0) return;

    const velocity = Math.hypot(gestureState.vx, gestureState.vy);
    const distance = Math.hypot(gestureState.dx, gestureState.dy);

    if (distance < 18 && velocity < 0.12) return;

    const gestureBoost = velocity * 2.8 + distance / 180;
    const horizontalIntent = Math.abs(gestureState.dx) >= Math.abs(gestureState.vx)
      ? gestureState.dx
      : gestureState.vx;
    const direction: SpinDirection = horizontalIntent >= 0 ? 'clockwise' : 'counterclockwise';

    spinWheel(gestureBoost, direction);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) + Math.abs(gestureState.dy) > 8;
    },
    onPanResponderRelease: (_, gestureState) => {
      spinFromGesture(gestureState);
    },
    onPanResponderTerminate: (_, gestureState) => {
      spinFromGesture(gestureState);
    },
  });

  const makePath = (index: number) => {
    const startAngle = index * anglePerSegment;
    const endAngle = (index + 1) * anglePerSegment;
    const degToRad = (deg: number) => (deg * Math.PI) / 180;

    // SOLUCIÓN AL BORDE: Dibujamos el SVG 2 píxeles más grande que el radio
    // para que se meta debajo del borde del View y no deje sombras.
    const drawRadius = RADIUS + 2; 

    const x1 = RADIUS + drawRadius * Math.cos(degToRad(startAngle));
    const y1 = RADIUS + drawRadius * Math.sin(degToRad(startAngle));
    const x2 = RADIUS + drawRadius * Math.cos(degToRad(endAngle));
    const y2 = RADIUS + drawRadius * Math.sin(degToRad(endAngle));

    return `M${RADIUS},${RADIUS} L${x1},${y1} A${drawRadius},${drawRadius} 0 0,1 ${x2},${y2} Z`;
  };

  return (
    <View style={styles.wheelWrapper}>
      {/* Brillos de fondo para efecto neón */}
      <View style={styles.neonOuterGlow} />
      
      <Animated.View style={[styles.wheel, animatedStyle]} {...panResponder.panHandlers}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ backgroundColor: 'transparent' }}>
          <G rotation={visualOffset} origin={`${RADIUS}, ${RADIUS}`}>
            {data.map((item, i) => (
              <G key={i}>
                <Path 
                  d={makePath(i)} 
                  fill={item.color} 
                  stroke="#000"
                  strokeWidth="2"
                />
                <SvgText
                  x={RADIUS + RADIUS / 1.5 * Math.cos((Math.PI * (i * anglePerSegment + anglePerSegment / 2)) / 180)}
                  y={RADIUS + RADIUS / 1.5 * Math.sin((Math.PI * (i * anglePerSegment + anglePerSegment / 2)) / 180)}
                  fill="white"
                  fontSize="13"
                  fontWeight="900"
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="0.6"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${(i * anglePerSegment + anglePerSegment / 2)}, 
                    ${RADIUS + RADIUS / 1.5 * Math.cos((Math.PI * (i * anglePerSegment + anglePerSegment / 2)) / 180)}, 
                    ${RADIUS + RADIUS / 1.5 * Math.sin((Math.PI * (i * anglePerSegment + anglePerSegment / 2)) / 180)})`}
                >
                  {item.label}
                </SvgText>
              </G>
            ))}
          </G>
        </Svg>
      </Animated.View>

      {/* Puntero e Icono Central */}
      <View style={styles.pointer} />
      <TouchableOpacity 
          onPress={() => spinWheel()} 
          disabled={isSpinning || disabled}
          activeOpacity={0.9} 
          style={styles.centerButton}>
        <Ionicons name="sync" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default function PlayScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const appLanguage = (i18n.resolvedLanguage || i18n.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  const [idUser, setIdUser] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [categories, setCategories] = useState<RouletteCategory[]>([]);
  const [cards, setCards] = useState<RouletteCard[]>([]);
  const [spinLimit, setSpinLimit] = useState<number>(0);
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string>('');
  const [infiniteSpins, setInfiniteSpins] = useState<boolean>(false);
  const [resultModal, setResultModal] = useState<ResultModalState>({
    visible: false,
    category: '',
    content: '',
  });

  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const applyRewardedSpinBonus = useCallback(async () => {
    if (!idUser || !token || infiniteSpins) return;

    try {
      const response = await fetch(REWARDED_SPIN_BONUS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(token),
        },
        body: JSON.stringify({ id_user: Number(idUser) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo aplicar el bonus por anuncio.');
      }

      if (typeof data?.current_usage !== 'undefined') {
        setCurrentUsage(Number(data.current_usage));
      }

      if (typeof data?.spin_limit !== 'undefined') {
        setSpinLimit(Number(data.spin_limit));
      }
    } catch (error) {
      console.log('Error aplicando bonus por anuncio:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo aplicar el bonus por anuncio.');
    }
  }, [idUser, infiniteSpins, token]);

  const loadInterstitialAd = () => {
    const unsuscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
    });

    const unsuscribeClose = interstitial.addAdEventListener(AdEventType.CLOSED, async () => {
      await applyRewardedSpinBonus();
      setInterstitialLoaded(false);
      interstitial.load();
    });

    interstitial.load();
    return () => {
      unsuscribeLoaded();
      unsuscribeClose();
    };
  };

  useEffect(() => {
    const unsuscribeInterstitialEvents = loadInterstitialAd();

    return unsuscribeInterstitialEvents;
  }, [applyRewardedSpinBonus]);

  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);
  const cardTranslateY = useSharedValue(28);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const resultCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value },
    ],
  }));

  const isGuestUser = !token;
  const remainingSpins = Math.max(spinLimit - currentUsage, 0);
  const usedSpins = Math.min(currentUsage, spinLimit);
  const shouldShowLimitActions = !isGuestUser && !infiniteSpins && remainingSpins <= 0 && subscriptionStatus?.state !== 'active';
  const wheelData: WheelSegment[] = isGuestUser
    ? [{ id: -1, label: t('play.guestWheelLabel'), color: '#7B61FF' }]
    : categories.map((category, index) => ({
        id: category.id,
        label: category.name,
        color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      }));

  const promptSignInForSpin = () => {
    Alert.alert(
      t('play.authRequiredTitle'),
      t('play.authRequiredMessage'),
      [
        { text: t('play.authRequiredCancel'), style: 'cancel' },
        {
          text: t('play.authRequiredAction'),
          onPress: () => router.push('/singin'),
        },
      ]
    );
  };

  useEffect(() => {
    const loadRouletteData = async () => {
      setSubscriptionError('');

      try {
        const [storedUserId, storedToken, storedUserInfo] = await Promise.all([
          AsyncStorage.getItem('user_id'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user_information'),
        ]);

        const parsedUser = storedUserInfo ? JSON.parse(storedUserInfo) : null;
        const resolvedUserId = String(storedUserId || parsedUser?.id || '').trim();

        if (!resolvedUserId) {
          setIdUser('');
          setToken('');
          return;
        }

        setIdUser(resolvedUserId);
        setToken(storedToken ?? '');

        // Validar suscripción
        try {
          const subscriptionResponse = await fetch(`${API_BASE_URL}/subscription_status/${resolvedUserId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': appLanguage,
              'X-App-Language': appLanguage,
              ...buildAuthHeaders(storedToken),
            },
          });

          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            setSubscriptionStatus(subscriptionData.subscription || null);
            
            // Validar que sea activa y del tipo correcto
            const sub = subscriptionData.subscription;
            if (sub && sub.state === 'active' && ['monthly', 'annual'].includes(sub.type)) {
              setInfiniteSpins(true);
            }
          }
        } catch (subError) {
          console.log('Advertencia: No se pudo validar suscripción:', subError);
          // No mostrar error de suscripción, permitir jugar con límite
        }

        // Cargar datos de la ruleta
        const response = await fetch(`${API_BASE_URL}/roulette-data/${resolvedUserId}?lang=${appLanguage}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': appLanguage,
            'X-App-Language': appLanguage,
            ...buildAuthHeaders(storedToken),
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || t('play.rouletteLoadError'));
        }

        setCategories(Array.isArray(data?.categories) ? data.categories : []);
        setCards(Array.isArray(data?.cards) ? data.cards : []);
        setSpinLimit(Number(data?.spin_limit ?? 0));
        setCurrentUsage(Number(data?.current_usage ?? 0));
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : t('play.rouletteLoadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadRouletteData();
  }, [appLanguage, t]);

  const incrementUsage = async () => {
    if (!idUser) return;

    const response = await fetch(`${API_BASE_URL}/increment-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify({ id_user: Number(idUser) }),
    });

    const data = await response.json();

    if (!response.ok && !data?.limit_reached) {
      throw new Error(data?.message || t('play.usageUpdateError'));
    }

    setCurrentUsage(Number(data?.current_usage ?? currentUsage));
    setSpinLimit(Number(data?.spin_limit ?? spinLimit));

    return data;
  };

  const openResultModal = (category: string, content: string) => {
    setResultModal({
      visible: true,
      category,
      content,
    });

    backdropOpacity.value = 0;
    cardScale.value = 0.92;
    cardTranslateY.value = 28;

    backdropOpacity.value = withTiming(1, { duration: 220 });
    cardScale.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    cardTranslateY.value = withTiming(0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  };

  const hideResultModalState = () => {
    setResultModal((prev) => ({ ...prev, visible: false }));
  };

  const closeResultModal = () => {
    backdropOpacity.value = withTiming(0, { duration: 180 });
    cardScale.value = withTiming(0.94, { duration: 200 });
    cardTranslateY.value = withTiming(24, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(hideResultModalState)();
      }
    });
  };

  const handleFinish = async (resultSegment: WheelSegment) => {
    try {
      const usageData = await incrementUsage();

      if (usageData?.limit_reached && usageData?.was_incremented === false) {
        alert(t('play.limitReached'));
        return;
      }

      const categoryCards = cards.filter((card) => card.category_id === resultSegment.id);
      const selectedCard =
        categoryCards.length > 0
          ? categoryCards[Math.floor(Math.random() * categoryCards.length)]
          : null;

      openResultModal(
        resultSegment.label,
        selectedCard?.content ?? t('play.noCardInCategory')
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : t('play.spinProcessError'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.shotsLabel}>
          {isGuestUser
            ? t('play.signInToSpin')
            : (infiniteSpins ? t('play.unlimitedSpins') : t('play.spinsAvailable'))}
        </Text>
        {!isGuestUser && !infiniteSpins && (
          <View style={styles.shotsBadge}>
            <Text style={styles.shotsText}>{usedSpins} / {spinLimit}</Text>
          </View>
        )}
      </View>

      <View style={[styles.content, shouldShowLimitActions && styles.contentWithLimitActions]}>
        {isLoading ? (
          <Text style={styles.helperText}>{t('play.loadingRoulette')}</Text>
        ) : loadError ? (
          <Text style={styles.helperText}>{loadError}</Text>
        ) : wheelData.length === 0 ? (
          <Text style={styles.helperText}>{t('play.noCategories')}</Text>
        ) : (
          <WheelOfFortune
            data={wheelData}
            disabled={!isGuestUser && !infiniteSpins && remainingSpins <= 0}
            requireAuth={isGuestUser}
            onRequireAuth={promptSignInForSpin}
            onFinished={handleFinish}
          />
        )}
      </View>

      <View style={styles.limitSection}>
        {
          shouldShowLimitActions ? (
            <View style={styles.limitActionsContainer}>
              <Text style={styles.helperText}>{t('play.noSpinsLeft', 'No te quedan giros.')}</Text>
              {interstitialLoaded ? (
                <TouchableOpacity
                  style={styles.subscriptionButton}
                  onPress={() => {
                    interstitial.show();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.subscriptionButtonText}>{t('play.viewAds')}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.helperText}>{t('play.loadingAds')}</Text>
              )}

              <TouchableOpacity
                style={styles.subscriptionButton}
                onPress={() => router.push('/subscription_plans')}
                activeOpacity={0.85}
              >
                <Text style={styles.subscriptionButtonText}>{t('play.subscriptionButton')}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
    
      </View>
      <Modal
        visible={resultModal.visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeResultModal}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeResultModal}>
            <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyle]} />
          </Pressable>

          <Animated.View style={[styles.resultCardContainer, resultCardAnimatedStyle]}>
            <View style={styles.resultCardGlow}>
              <View style={styles.resultCard}>
                <View style={styles.resultCategoryChip}>
                  <Text style={styles.resultCategoryText}>{resultModal.category.toUpperCase()}</Text>
                </View>

                <Text style={styles.resultContentText}>{resultModal.content}</Text>

                <TouchableOpacity style={styles.resultReplayButton} onPress={closeResultModal} activeOpacity={0.8}>
                  <Ionicons name="refresh-outline" size={16} color="#8E9BB6" />
                  <Text style={styles.resultReplayText}>{t('play.spinAgain')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A18', // Fondo oscuro profundo
  },
  header: {
    width: '100%',
    height: 72,
    minHeight: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    zIndex: 10,
  },
  shotsLabel: {
    color: '#9BA3B2',
    fontSize: 14,
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 12,
  },
  shotsBadge: {
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7B61FF',
  },
  shotsText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWithLimitActions: {
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  limitSection: {
    width: '100%',
    paddingBottom: 14,
  },
  helperText: {
    color: '#BFC7D5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  limitActionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  subscriptionButton: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  subscriptionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  wheelWrapper: {
    width: WHEEL_SIZE + 50,
    height: WHEEL_SIZE + 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: RADIUS,
    borderWidth: 8,
    borderColor: '#5A46C7', // Cambia a 'red' si quieres probar el borde rojo
    backgroundColor: 'transparent', 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 16,
  },
  neonOuterGlow: {
    position: 'absolute',
    width: WHEEL_SIZE + 20,
    height: WHEEL_SIZE + 20,
    borderRadius: (WHEEL_SIZE + 20) / 2,
    borderWidth: 3,
    borderColor: 'rgba(123, 97, 255, 0.4)',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  pointer: {
    width: 30,
    height: 45,
    backgroundColor: '#FFC107',
    borderRadius: 8,
    position: 'absolute',
    top: 10,
    zIndex: 100,
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  centerButton: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7B61FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFF',
    zIndex: 200,
    elevation: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 23, 0.72)',
  },
  resultCardContainer: {
    width: '100%',
    maxWidth: 560,
    zIndex: 2,
  },
  resultCardGlow: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(83, 59, 186, 0.8)',
    shadowColor: '#2E1F85',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 16,
    backgroundColor: '#0A1540',
    padding: 6,
  },
  resultCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(53, 31, 143, 0.95)',
    backgroundColor: '#0D1A4A',
    paddingVertical: 36,
    paddingHorizontal: 26,
    alignItems: 'center',
    gap: 24,
  },
  resultCategoryChip: {
    backgroundColor: 'rgba(107, 61, 198, 0.35)',
    borderColor: 'rgba(145, 93, 240, 0.7)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  resultCategoryText: {
    color: '#D8C7FF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  resultContentText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
  },
  resultReplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  resultReplayText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '600',
  }
});
