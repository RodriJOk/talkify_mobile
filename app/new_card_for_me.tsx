import { getAuthHeaders } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'https://talkify.store/api';

type Category = {
  id: number;
  name: string;
};


export default function NewCardForMe() {
  const { t, i18n } = useTranslation();
  const appLanguage = (i18n.resolvedLanguage || i18n.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [categories, setCategories] = useState<Category[]>([]);
  const pickerOptionColor = Platform.OS === 'android' ? '#111111' : '#FFFFFF';
  const pickerPlaceholderColor = Platform.OS === 'android' ? '#6B7280' : '#8EA0C1';

  const saveCard = async () => {
      if (!content.trim()) {
      alert(t('cardsForm.emptyContent'));
      return;
      }
      if (!String(userId).trim()) {
      alert(t('newCardForMe.missingUser'));
      return;
      }
      if (!category) {
      alert(t('cardsForm.missingCategory'));
      return;
      }
      console.log({
        content: content.trim(),
        category_id: parseInt(category, 10),
        state: status,
        user_id: Number(userId),
      });
      try {
      const authHeaders = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/create_card_for_me`, {
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
            state: status,
            user_id: Number(userId),
          }),
      });
      //Poner un log de response.body
      console.log('Respuesta cruda de la API:', response);
      const data = await response.json();
      console.log('Respuesta de la API:', data);
      if (!response.ok) {
          throw new Error(data?.message || t('cardsForm.saveErrorFallback'));
      }
        alert(t('cardsForm.saveSuccess'));
      setContent('');
      setCategory('');
        setStatus('active');
      } catch (error: any) {
      Toast.show({
          type: 'error',
          text1: t('cardsForm.saveErrorTitle'),
          text2: error.message || t('cardsForm.saveErrorFallback'),
      });
      }
  }

  useEffect(() => {
      const loadUserId = async () => {
      try {
        const [storedUserId, storedUserInfo] = await Promise.all([
        AsyncStorage.getItem('user_id'),
        AsyncStorage.getItem('user_information'),
        ]);

        const parsedUser = storedUserInfo ? JSON.parse(storedUserInfo) : null;
        const resolvedUserId = String(storedUserId || parsedUser?.id || '').trim();
        setUserId(resolvedUserId);
      } catch (error) {
        setUserId('');
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

        loadUserId();
      loadCategories();
  }, [appLanguage, t]);

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>{t('newCardForMe.title')}</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="person-circle" size={46} color="#FFFFFF" />
          <Text style={styles.cardTitle}>{t('newCardForMe.modeTitle')}</Text>
          <Text style={styles.cardDescription}>
            {t('newCardForMe.modeDescription')}
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardEyebrow}>{t('cardsForm.newCard')}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('cardsForm.content')}</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={5}
              value={content}
              onChangeText={setContent}
              placeholder={t('cardsForm.contentPlaceholder')}
              placeholderTextColor="#6E7B99"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('cardsForm.category')}</Text>
            <View style={styles.selectField}>
              <Picker
                selectedValue={category}
                onValueChange={(value) => setCategory(String(value))}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
                mode="dropdown"
              >
                <Picker.Item label={t('cardsForm.selectCategory')} value="" color={pickerPlaceholderColor} />
                {categories.map((item) => (
                  <Picker.Item key={item.id} label={item.name} value={String(item.id)} color={pickerOptionColor} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('cardsForm.state')}</Text>
            <TouchableOpacity
              style={styles.selectField}
              activeOpacity={0.85}
              onPress={() => setStatus('active')}
            >
              <Text style={styles.selectText}>{t('cardsForm.stateActive')}</Text>
              <Ionicons name="chevron-down" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            activeOpacity={0.9}
            onPress={saveCard}>
            <Text style={styles.saveButtonText}>{t('cardsForm.saveCard')}</Text>
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
    fontSize: 15,
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
