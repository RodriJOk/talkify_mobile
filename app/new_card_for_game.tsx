import { getAuthHeaders } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'https://talkify.store/api';

type Category = {
  id: number;
  name: string;
};


export default function NewCardForGame() {
  const { t, i18n } = useTranslation();
  const appLanguage = (i18n.resolvedLanguage || i18n.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  const [content, setContent] = useState('');
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const pickerOptionColor = Platform.OS === 'android' ? '#111111' : '#FFFFFF';
  const pickerPlaceholderColor = Platform.OS === 'android' ? '#6B7280' : '#8EA0C1';
  
  const saveCard = async () => {
    if (isSaving) return;

    if (isGuestUser) {
      promptSignInForCards();
      return;
    }
    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: t('cardsForm.emptyContent'),
      });
      return;
    }
    if (!category) {
      Toast.show({
        type: 'error',
        text1: t('cardsForm.missingCategory'),
      });
      return;
    }

    try {
      setIsSaving(true);
      const authHeaders = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/create_card_for_game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': appLanguage,
          'X-App-Language': appLanguage,
          ...authHeaders,
        },
        body: JSON.stringify({
          content: content.trim(),
          category_id: parseInt(category, 10),
          state: 'pending',
        }),
      });

      const rawData = await response.text();
      let data: any = null;

      try {
        data = rawData ? JSON.parse(rawData) : null;
      } catch {
        data = null;
      }

      const backendMessage = data?.message || data?.error || data?.detail;
      const backendRejected = data?.success === false || data?.ok === false || data?.status === 'error';

      if (!response.ok || backendRejected) {
        throw new Error(backendMessage || t('cardsForm.saveErrorFallback'));
      }

      Toast.show({
        type: 'success',
        text1: t('cardsForm.saveSuccess'),
      });
      setContent('');
      setCategory('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('cardsForm.saveErrorFallback');

      Toast.show({
        type: 'error',
        text1: t('cardsForm.saveErrorTitle'),
        text2: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };
    
      useEffect(() => {
        const loadSession = async () => {
          try {
            const [storedUserId, storedToken] = await Promise.all([
              AsyncStorage.getItem('user_id'),
              AsyncStorage.getItem('token'),
            ]);

            setIsGuestUser(!(storedUserId && storedToken));
          } catch (error) {
            setIsGuestUser(true);
          }
        };

        const loadCategories = async () => {
          try {
            const authHeaders = await getAuthHeaders();

            const response = await fetch(`${API_BASE_URL}/get_categories?lang=${appLanguage}`, {
              headers: {
                'Accept-Language': appLanguage,
                'X-App-Language': appLanguage,
                ...authHeaders,
              },
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data?.message || t('cardsForm.categoriesLoadError'));
            }
    
            setCategories(Array.isArray(data?.categories) ? data.categories : []);
          } catch (error) {
            setCategories([]);
          }
        };
        loadSession();
        loadCategories();
      }, [appLanguage, t]);

  const router = useRouter();

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>{t('newCardForGame.title')}</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="game-controller" size={46} color="#FFFFFF" />
          <Text style={styles.cardTitle}>{t('newCardForGame.modeTitle')}</Text>
          <Text style={styles.cardDescription}>
            {t('newCardForGame.modeDescription')}
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardEyebrow}>{t('cardsForm.newCard')}</Text>

          {isGuestUser && (
            <TouchableOpacity style={styles.noticeCard} activeOpacity={0.9} onPress={promptSignInForCards}>
              <Text style={styles.noticeText}>{t('newCards.loginRequiredHint')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('cardsForm.content')}</Text>
            <TextInput
              style={[styles.textArea, isGuestUser && styles.inputDisabled]}
              multiline
              numberOfLines={5}
              value={content}
              onChangeText={setContent}
              keyboardType="default"
              placeholder={t('cardsForm.contentPlaceholder')}
              placeholderTextColor="#6E7B99"
              textAlignVertical="top"
              editable={!isGuestUser}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('cardsForm.category')}</Text>
            <View style={[styles.selectField, isGuestUser && styles.inputDisabled]}>
              <Picker
                selectedValue={category}
                onValueChange={(value) => setCategory(String(value))}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
                mode="dropdown"
                enabled={!isGuestUser}
              >
                <Picker.Item label={t('cardsForm.selectCategory')} value="" color={pickerPlaceholderColor} />
                {categories.map((item) => (
                  <Picker.Item key={item.id} label={item.name} value={String(item.id)} color={pickerOptionColor} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, isGuestUser && styles.saveButtonDisabled]} 
            activeOpacity={0.9}
            disabled={isSaving}
            onPress={saveCard}>
            <Text style={styles.saveButtonText}>{isGuestUser ? t('newCards.loginToCreate') : t('cardsForm.saveCard')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.85}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#6D42D8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 14,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#C9C6F9',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  backButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  cardEyebrow: {
    color: '#9BA3B2',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  noticeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 254, 0.28)',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noticeText: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6D42D8',
    backgroundColor: '#0A1026',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  inputDisabled: {
    opacity: 0.55,
  },
  selectField: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6D42D8',
    backgroundColor: '#0A1026',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    color: '#FFFFFF',
    marginHorizontal: -6,
  },
  selectText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#4B5563',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
