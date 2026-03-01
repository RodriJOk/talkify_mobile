import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ForgetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const goBack = () => {
    router.replace('/singin');
  };

  const resetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Por favor ingresa tu correo electrónico',
      });
      return;
    }

    try {
      const response = await fetch('https://talkify.store/api/forget_password', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          },
          body: JSON.stringify({ email }),
      });

      if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
      }

      Toast.show({
          type: 'success',
          text1: 'Se ha enviado un enlace para restablecer tu contraseña',
      });
      } catch (error) {
      Toast.show({
          type: 'error',
          text1: 'Error al enviar el correo electrónico',
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000a23', padding: 16, justifyContent: 'center' }}>
        <Image
              source={require('@/assets/images/neon_icon_small.png')}
              style={styles.logoHeader}
          />
        <Text style={ styles.headerText }>
          Por favor, ingresa el email con el que te registraste
        </Text>
        <View style= {{marginBottom: 32, marginTop: 32}}>
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
        <View style={styles.container_buttons_CTA}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={resetPassword}>
              <LinearGradient
                colors={['#6366f1', '#a855f7']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Enviar</Text>
              </LinearGradient>
          </TouchableOpacity>
        </View>
        <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerText: {
    textAlign: 'center', 
    marginBottom: 16, 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold', 
    fontFamily: 'Poppins-Regular' 
  },
  logoHeader: {
    height: 150,
    width: 150,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'center',
    objectFit: 'contain',
  },
  input: {
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
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 12,
    height: 45,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  container_buttons_CTA:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
  },
  forgetPasswordLink: {
    alignItems: 'center',
    fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
  },
});
