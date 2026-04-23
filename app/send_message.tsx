import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'https://talkify.store/api';

export default function SendMessage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('token').then((stored) => setToken(stored));
  }, []);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error,
        visibilityTime: 3000,
        position: 'top',
      });
      setError('');
    }
  }, [error]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError(t('sendMessage.fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t('sendMessage.sendError'));
      }

      Toast.show({
        type: 'success',
        text1: t('sendMessage.successTitle'),
        text2: t('sendMessage.successMessage'),
        visibilityTime: 4000,
        position: 'top',
      });

      setSubject('');
      setMessage('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('sendMessage.sendError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: '#000a23' }}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/neon_logo_transparente.png')}
          style={styles.logoHeader}
        />

        <Text style={styles.headerText}>{t('sendMessage.title')}</Text>

        {!token ? (
          <View style={styles.authContainer}>
            <Text style={styles.authHint}>{t('sendMessage.authRequiredHint')}</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/singin')}
            >
              <LinearGradient
                colors={['#6366f1', '#a855f7']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.buttonText}>{t('sendMessage.loginToContinue')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('sendMessage.subjectLabel')}</Text>
              <TextInput
                placeholder={t('sendMessage.subjectPlaceholder')}
                placeholderTextColor="#aaa"
                value={subject}
                onChangeText={setSubject}
                style={styles.input}
                autoCapitalize="sentences"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('sendMessage.messageLabel')}</Text>
              <TextInput
                placeholder={t('sendMessage.messagePlaceholder')}
                placeholderTextColor="#aaa"
                value={message}
                onChangeText={setMessage}
                style={[styles.input, styles.messageInput]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#6366f1', '#a855f7']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? t('sendMessage.sending') : t('sendMessage.sendButton')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <Toast />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000a23',
    padding: 16,
    justifyContent: 'center',
  },
  logoHeader: {
    height: 120,
    width: 260,
    marginBottom: 16,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  headerText: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000',
  },
  messageInput: {
    height: 140,
  },
  sendButton: {
    borderRadius: 12,
    height: 50,
    marginTop: 8,
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  sendButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  authContainer: {
    alignItems: 'center',
    gap: 20,
    paddingTop: 16,
  },
  authHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  loginButton: {
    borderRadius: 12,
    width: '100%',
    height: 50,
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  loginButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
