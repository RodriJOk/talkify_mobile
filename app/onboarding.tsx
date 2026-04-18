import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type SlideItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef<FlatList<SlideItem> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides: SlideItem[] = [
    {
      key: '1',
      icon: 'game-controller-outline',
      title: t('onboarding.slide1Title'),
      description: t('onboarding.slide1Description'),
    },
    {
      key: '2',
      icon: 'sync-outline',
      title: t('onboarding.slide2Title'),
      description: t('onboarding.slide2Description'),
    },
    {
      key: '3',
      icon: 'sparkles-outline',
      title: t('onboarding.slide3Title'),
      description: t('onboarding.slide3Description'),
    },
  ];

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (activeIndex === slides.length - 1) {
      completeOnboarding();
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#000a23', '#1E1B4B', '#312E81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('onboarding.title')}</Text>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={slides}
            keyExtractor={(item) => item.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon} size={52} color="#E9D5FF" />
                </View>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideDescription}>{item.description}</Text>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.pagination}>
              {slides.map((slide, index) => (
                <View
                  key={slide.key}
                  style={[styles.dot, activeIndex === index && styles.dotActive]}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
              <Text style={styles.ctaText}>
                {activeIndex === slides.length - 1 ? t('onboarding.startButton') : t('onboarding.nextButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000a23',
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  skipText: {
    color: '#C4B5FD',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  slide: {
    width: width - 40,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(168, 85, 247, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  slideTitle: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 30,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  slideDescription: {
    color: '#E9D5FF',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 18,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#DDD6FE',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});
