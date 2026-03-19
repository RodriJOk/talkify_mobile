import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewCards() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isGuestUser, setIsGuestUser] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const [storedUserId, storedToken] = await Promise.all([
        AsyncStorage.getItem('user_id'),
        AsyncStorage.getItem('token'),
      ]);

      setIsGuestUser(!(storedUserId && storedToken));
    };

    loadSession();
  }, []);

  const promptSignInForCards = () => {
    Alert.alert(
      t('newCards.authRequiredTitle'),
      t('newCards.authRequiredMessage'),
      [
        { text: t('newCards.authRequiredCancel'), style: 'cancel' },
        {
          text: t('newCards.authRequiredAction'),
          onPress: () => router.push('/singin'),
        },
      ]
    );
  };

  const handleProtectedNavigation = (path: '/new_card_for_me' | '/new_card_for_game') => {
    if (isGuestUser) {
      promptSignInForCards();
      return;
    }

    router.push(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>{t('newCards.title')}</Text>
        </View>

        {isGuestUser && (
          <TouchableOpacity style={styles.noticeCard} activeOpacity={0.9} onPress={promptSignInForCards}>
            <Text style={styles.noticeText}>{t('newCards.loginRequiredHint')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, isGuestUser && styles.optionButtonDisabled]}
            activeOpacity={0.85}
            onPress={() => handleProtectedNavigation('/new_card_for_me')}
          >
            <Ionicons name="person" size={34} color="#FFFFFF" />
            <Text style={styles.optionText}>{t('newCards.forMe')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, isGuestUser && styles.optionButtonDisabled]}
            activeOpacity={0.85}
            onPress={() => handleProtectedNavigation('/new_card_for_game')}
          >
            <Ionicons name="game-controller" size={34} color="#FFFFFF" />
            <Text style={styles.optionText}>{t('newCards.forGame')}</Text>
          </TouchableOpacity>
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
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  headerAccent: {
    width: 6,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#8B5CF6',
  },
  formCard: {
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
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  buttonsContainer: {
    gap: 16,
  },
  noticeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 254, 0.28)',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  noticeText: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  optionButton: {
    minHeight: 132,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#6D42D8',
    backgroundColor: '#0F1733',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 14,
  },
  optionButtonDisabled: {
    opacity: 0.7,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
