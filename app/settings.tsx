import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '@/providers/LanguageProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [confirmDeletePassword, setConfirmDeletePassword] = useState('');

  const isWideLayout = useMemo(() => width >= 980, [width]);

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

  const promptSignInForProtectedSettings = () => {
    Alert.alert(
      t('settings.authRequiredTitle'),
      t('settings.authRequiredMessage'),
      [
        { text: t('settings.authRequiredCancel'), style: 'cancel' },
        {
          text: t('settings.authRequiredAction'),
          onPress: () => router.push('/singin'),
        },
      ]
    );
  };

  const handleUpdatePassword = () => {
    if (isGuestUser) {
      promptSignInForProtectedSettings();
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert(t('settings.incompleteFieldsTitle'), t('settings.incompleteFieldsMessage'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert(t('settings.invalidPasswordTitle'), t('settings.invalidPasswordMessage'));
      return;
    }

    Alert.alert(t('settings.comingSoonTitle'), t('settings.updatePasswordComingSoon'));
  };

  const handleDeleteAccount = () => {
    if (isGuestUser) {
      promptSignInForProtectedSettings();
      return;
    }

    if (!confirmDeletePassword) {
      Alert.alert(t('settings.confirmationRequiredTitle'), t('settings.confirmationRequiredMessage'));
      return;
    }

    Alert.alert(t('settings.comingSoonTitle'), t('settings.deleteAccountComingSoon'));
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
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        <View style={[styles.languagePanelGlow, isWideLayout && styles.languagePanelWide]}>
          <View style={styles.panelCard}>
            <Text style={styles.panelTitle}>{t('settings.languageTitle')}</Text>
            <Text style={styles.panelDescription}>{t('settings.languageDescription')}</Text>

            <View style={styles.languageOptionsRow}>
              <TouchableOpacity
                style={[styles.languageOption, language === 'es' && styles.languageOptionActive]}
                activeOpacity={0.9}
                onPress={() => setLanguage('es')}
              >
                <Text style={[styles.languageOptionText, language === 'es' && styles.languageOptionTextActive]}>
                  {t('settings.languageSpanish')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
                activeOpacity={0.9}
                onPress={() => setLanguage('en')}
              >
                <Text style={[styles.languageOptionText, language === 'en' && styles.languageOptionTextActive]}>
                  {t('settings.languageEnglish')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.cardsWrapper, isWideLayout && styles.cardsWrapperWide]}>
          <View style={[styles.panelGlow, styles.passwordPanelGlow, isWideLayout && styles.leftPanel]}>
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{t('settings.changePasswordTitle')}</Text>
              <Text style={styles.panelDescription}>{t('settings.changePasswordDescription')}</Text>
              {isGuestUser && (
                <TouchableOpacity style={styles.lockedNotice} onPress={promptSignInForProtectedSettings} activeOpacity={0.9}>
                  <Text style={styles.lockedNoticeText}>{t('settings.loginRequiredHint')}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('settings.currentPassword')}</Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  style={[styles.input, isGuestUser && styles.inputDisabled]}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isGuestUser}
                  pointerEvents={isGuestUser ? 'none' : 'auto'}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('settings.newPassword')}</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={[styles.input, isGuestUser && styles.inputDisabled]}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isGuestUser}
                  pointerEvents={isGuestUser ? 'none' : 'auto'}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('settings.confirmNewPassword')}</Text>
                <TextInput
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  style={[styles.input, isGuestUser && styles.inputDisabled]}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isGuestUser}
                  pointerEvents={isGuestUser ? 'none' : 'auto'}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleUpdatePassword} activeOpacity={0.9}>
                <LinearGradient
                  colors={isGuestUser ? ['#4B5563', '#374151'] : ['#A855F7', '#4F46E5']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isGuestUser ? t('settings.loginToContinue') : t('settings.saveNewPassword')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.panelGlow, styles.deletePanelGlow, isWideLayout && styles.rightPanel]}>
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{t('settings.deleteAccountTitle')}</Text>
              <Text style={styles.panelDescription}>{t('settings.deleteAccountDescription')}</Text>
              {isGuestUser && (
                <TouchableOpacity style={styles.lockedNotice} onPress={promptSignInForProtectedSettings} activeOpacity={0.9}>
                  <Text style={styles.lockedNoticeText}>{t('settings.loginRequiredHint')}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('settings.confirmPassword')}</Text>
                <TextInput
                  value={confirmDeletePassword}
                  onChangeText={setConfirmDeletePassword}
                  style={[styles.input, isGuestUser && styles.inputDisabled]}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isGuestUser}
                  pointerEvents={isGuestUser ? 'none' : 'auto'}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleDeleteAccount} activeOpacity={0.9}>
                <LinearGradient
                  colors={isGuestUser ? ['#4B5563', '#374151'] : ['#FF2B4A', '#E10098']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isGuestUser ? t('settings.loginToContinue') : t('settings.deleteAccountButton')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000a23',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 24,
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
  languagePanelGlow: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    backgroundColor: '#0D1844',
    padding: 4,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  languagePanelWide: {
    maxWidth: 1120,
    alignSelf: 'center',
    width: '100%',
  },
  languageOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  languageOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D4A86',
    backgroundColor: '#000a23',
    paddingVertical: 12,
    alignItems: 'center',
  },
  languageOptionActive: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.20)',
  },
  languageOptionText: {
    color: '#BFC7D5',
    fontSize: 15,
    fontWeight: '600',
  },
  languageOptionTextActive: {
    color: '#FFFFFF',
  },
  cardsWrapper: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    gap: 24,
  },
  cardsWrapperWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftPanel: {
    flex: 1,
  },
  rightPanel: {
    flex: 1,
  },
  panelGlow: {
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#0D1844',
    padding: 4,
  },
  passwordPanelGlow: {
    borderColor: 'rgba(123, 97, 255, 0.55)',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  deletePanelGlow: {
    borderColor: 'rgba(255, 43, 74, 0.45)',
    shadowColor: '#FF2B4A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  panelCard: {
    borderRadius: 16,
    backgroundColor: '#0D1A4A',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 10,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },
  panelDescription: {
    color: '#BFC7D5',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#D8C7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D4A86',
    backgroundColor: '#000a23',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  lockedNotice: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 254, 0.25)',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  lockedNoticeText: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    height: 45,
    shadowColor: 'rgba(168, 85, 247, 0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
