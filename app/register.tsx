import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, Switch, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {Picker} from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function SingIn() {
  const router = useRouter();

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
        text1: 'Por favor, completa todos los campos.',
      });
      return;
    }

    if (!name || name.length < 2) {
      Toast.show({
        type: 'error',
        text1: 'El nombre debe tener al menos 2 caracteres.',
      });
      return;
    }

    if (!surname || surname.length < 2) {
      Toast.show({
        type: 'error',
        text1: 'El apellido debe tener al menos 2 caracteres.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Por favor, ingresa un correo electrónico válido.',
      });
      return;
    }
    
    if (!aceptTerms) {
      Toast.show({
        type: 'error',
        text1: 'Debes aceptar los términos y condiciones.',
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'La contraseña debe tener al menos: ',
        text2: '8 caracteres, una mayúscula, un número y un carácter especial.',
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
          text1: 'Error al crear el usuario.',
        });
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Redirigir o guardar estado
      Toast.show({
        type: 'success',
        text1: '¡Registro exitoso!',
      });

      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error al crear el usuario.',
      });

      setError(err.message);
    }
  };

  const handleTermsAndConditions = () => {
    router.push('/terms_and_conditions');
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
          <Text style={ styles.headerText }>
              Registrate
          </Text>
          <View style={styles.containerInput}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
            />
          </View>
          <View style={styles.containerInput}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              placeholder="Apellido"
              value={surname}
              onChangeText={setSurname}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="default"
          />
          </View>
          <View style={styles.containerInput}>
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
          <View style={styles.containerInput}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                placeholder="Contraseña"
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
                  Acepto los{' '}
                  <Text
                      style={{ color: '#007BFF', textDecorationLine: 'underline' }}
                      onPress={handleTermsAndConditions}>
                  términos y condiciones
                  </Text>
              </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Crear Usuario</Text>
          </TouchableOpacity>
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
    height: '100%', 
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
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
});