import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

export default function SingIn() {
  const router = useRouter();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipeUser, setTipeUser] = useState('');
  const [idTipeUser, setIdTipeUser] = useState(0);
  const [aceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !surname || !email || !password) {
      Toast.show({
        type: 'error',
        text1: t('register.fillAllFields'),
      });
      return;
    }

    if (!name || name.length < 2) {
      Toast.show({
        type: 'error',
        text1: t('register.invalidName'),
      });
      return;
    }

    if (!surname || surname.length < 2) {
      Toast.show({
        type: 'error',
        text1: t('register.invalidSurname'),
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: t('register.invalidEmail'),
      });
      return;
    }
    
    if (!aceptTerms) {
      Toast.show({
        type: 'error',
        text1: t('register.mustAcceptTerms'),
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Toast.show({
        type: 'error',
        text1: t('register.invalidPasswordLine1'),
        text2: t('register.invalidPasswordLine2'),
      });
      return;
    }

    console.log('Handling register with:', {
      name,
      surname,
      email,
      password,
      acepted_terms: aceptTerms === true ? "true" : "false",
    });

    try {
      const response = await fetch('https://talkify.store/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          surname,
          email, 
          password,
          acepted_terms: aceptTerms === true ? "true" : "false",
        }),
      });

      const data = await response.json();
      console.log('Response data:', data);
      if (!response.ok) {
        Toast.show({
          type: 'error',
          text1: t('register.createUserError'),
        });
        throw new Error(data.message || t('register.registerErrorFallback'));
      }

      // Redirigir o guardar estado
      Toast.show({
        type: 'success',
        text1: t('register.registerSuccess'),
      });

      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('register.createUserError'),
      });

      setError(err.message);
    }
  };

  const handleTermsAndConditions = () => {
    router.push('/terms_and_conditions');
  }

  const goBack = () => {
    router.replace('/singin');
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
          <Text style={ styles.headerText }>
              {t('register.title')}
          </Text>
          <View style={styles.containerInput}>
            <Text style={styles.label}>{t('register.nameLabel')}</Text>
            <TextInput
                placeholder={t('register.namePlaceholder')}
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
            />
          </View>
          <View style={styles.containerInput}>
            <Text style={styles.label}>{t('register.surnameLabel')}</Text>
            <TextInput
              placeholder={t('register.surnamePlaceholder')}
              value={surname}
              onChangeText={setSurname}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="default"
          />
          </View>
          <View style={styles.containerInput}>
            <Text style={styles.label}>{t('register.emailLabel')}</Text>
            <TextInput
              placeholder={t('register.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
          />
          </View>
          <View style={styles.containerInput}>
            <Text style={styles.label}>{t('register.passwordLabel')}</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                placeholder={t('register.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                style={[styles.input]} // espacio para el icono
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={{ position: "absolute", right: 10, top: 12 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.containerTermsAndConditions}>
              <Switch
                value={aceptTerms}
                onValueChange={setAcceptTerms}
                thumbColor={aceptTerms ? '#007BFF' : '#ccc'}
                trackColor={{ false: '#ccc', true: '#80bdff' }}
              />
              <Text style={[styles.label, { marginLeft: 8 }]}>
                  {t('register.acceptTermsPrefix')}
                  <Text
                      style={{ color: '#007BFF', textDecorationLine: 'underline' }}
                      onPress={handleTermsAndConditions}>
                  {t('register.acceptTermsLink')}
                  </Text>
              </Text>
          </View>
          <View style={styles.container_buttons_CTA}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Text style={styles.buttonText}>{t('common.back')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <LinearGradient
                colors={['#6366f1', '#a855f7']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t('register.createUser')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Toast />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1, 
    backgroundColor: '#000a23', 
    padding: 16, 
    justifyContent: 'center',
    fontFamily: 'Poppins-Regular',
  },
  headerText: {
    textAlign: 'center', 
    marginBottom: 16, 
    marginTop: 20,
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold', 
    fontFamily: 'Poppins-Regular',
  },
  containerInput: {
    marginBottom: 16,
    marginTop: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  logoHeader: {
    height: 100,
    width: 200,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'center',
    objectFit: 'contain',
  },
  input: {
    color: '#000',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    borderRadius: 12,
    height: 45,
    width: '48%',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
    marginVertical: 16,
  },
  backButton: {
    backgroundColor: 'transparent',
    height: 45,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#007BFF',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  forgetPasswordLink: {
    alignItems: 'center',
    fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
  },
  containerTermsAndConditions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'center',
  },
  container_buttons_CTA: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});