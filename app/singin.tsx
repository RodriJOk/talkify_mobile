import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';


export default function SingIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    
    setError('');
    try {
      const response = await fetch('https://talkify.store/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: String(email).trim(), password: String(password) }),
      });

      const data = await response.json();
      // {"access_token": "2|n1XFSNyhvBtW39808Bpin7GGRonhqtf07SjdyD0N25696d89", 
      // "token_type": "Bearer", 
      // "user": 
      // {"acepted_terms": "on", 
      // "created_at": "2026-02-15T12:56:03.000000Z", 
      // "email": "juarezrodrigo59@gmail.com", 
      // "email_verification_token": null, 
      // "email_verified_at": "2026-02-15T12:56:43.000000Z", 
      // "id": 101, 
      // "must_view_introduction": null, 
      // "name": "Rodrigo", 
      // "surname": "Juarez", 
      // "two_factor_confirmed_at": null, 
      // "updated_at": "2026-02-15T12:56:43.000000Z"}

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      Toast.show({
        type: 'success',
        text1: '¡Login exitoso!',
      });

      await AsyncStorage.setItem('user_information', JSON.stringify(data?.user ?? {}));
      await AsyncStorage.setItem('user_id', String(data?.user?.id ?? ''));
      await AsyncStorage.setItem('token', String(data?.access_token ?? ''));
      
      // Navegar a /(tabs) para forzar recarga completa
      router.replace('/(tabs)');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    }
  };

  const goToResetPassword = () => {
    router.replace('/forget_password');
  };

  const goToRegister = () => {
    router.replace('/register');
  };

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        visibilityTime: 3000,
        position: 'top',
      });
      setError(''); 
    }
  }, [error]);
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: '#000a23' }}>
        <View style={{ flex: 1, backgroundColor: '#000a23', padding: 16, justifyContent: 'center' }}>
            <Image
                source={require('@/assets/images/neon_icon_small.png')}
                style={styles.logoHeader}
            />
            <Text style={ styles.headerText }>
                Ingresa tus credenciales
            </Text>
            <View style= {{marginBottom: 24}}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                    placeholder="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>
            <View style= {{marginBottom: 24}}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.input, { color: '#000' }]}
                    secureTextEntry
                />
            </View>
            <TouchableOpacity style={styles.forgetPasswordLink} onPress={goToResetPassword}>
                <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <View style={styles.container_buttons_CTA}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={goToRegister}>
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleLogin}>
                    <Text style={styles.buttonText}>Ingresar</Text>
                </TouchableOpacity>
            </View>
            <Toast />
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    textAlign: 'center', 
    marginBottom: 24, 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold', 
    fontFamily: 'Poppins-Regular' 
  },
  logoHeader: {
    height: 150,
    width: 300,
    marginBottom: 24,
    alignSelf: 'center',
    resizeMode: 'contain', // Cambiado de objectFit a resizeMode para React Native
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#012e46',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  link: {
    color: '#007BFF',
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  container_buttons_CTA:{
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  forgetPasswordLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
