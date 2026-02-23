import { Button } from '@react-navigation/elements';
import React from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsAndConditions() {
  const router = useRouter();
  const onPress = () => {
    router.push('/register');
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
      }}>
        <TouchableOpacity
          onPress={onPress}
          style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#000a23',
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 8,
              marginBottom: 20,
          }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          {/* <Text
              style={{
              color: '#fff',
              fontSize: 16,
              marginLeft: 8,
              }}>
              Volver
          </Text> */}
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Términos y Condiciones de Uso</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Aceptación de los Términos</Text>
        <Text style={styles.paragraph}>
          Al acceder y utilizar este sitio web, el Usuario acepta los presentes Términos y Condiciones de Uso. 
          Si no está de acuerdo con ellos, debe abstenerse de utilizar el sitio. 
          El uso continuo del sitio se considerará como aceptación plena de estos términos.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. Modificación de los Términos</Text>
        <Text style={styles.paragraph}>
          ReservaTuCorte podrá modificar estos Términos y Condiciones en cualquier momento. 
          Las modificaciones estarán vigentes desde el momento en que se publiquen en el sitio. 
          Se recomienda al Usuario revisar periódicamente los términos vigentes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Objeto del Sitio</Text>
        <Text style={styles.paragraph}>
          ReservaTuCorte.com.ar es una plataforma web que permite a los usuarios reservar turnos en peluquerías y barberías adheridas, 
          gestionar sus reservas y consultar disponibilidad.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. Registro de Usuarios</Text>
        <Text style={styles.paragraph}>
          Para acceder a ciertos servicios del sitio, es necesario registrarse y proporcionar información veraz y actualizada. 
          El Usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades realizadas bajo su cuenta.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>5. Uso del Sitio</Text>
        <Text style={styles.paragraph}>
          El Usuario se compromete a utilizar el sitio solo con fines lícitos y de manera que no infrinja derechos de terceros 
          ni afecte el funcionamiento de la plataforma. 
          Queda prohibido cualquier uso indebido que pueda comprometer la seguridad del sitio.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>6. Capacidad Legal</Text>
        <Text style={styles.paragraph}>
          Los servicios del sitio están disponibles solo para personas con capacidad legal para contratar. 
          No podrán utilizar los servicios menores de edad sin supervisión o personas que hayan sido suspendidas o dadas de baja de la plataforma.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>7. Privacidad y Protección de Datos</Text>
        <Text style={styles.paragraph}>
          La información personal brindada por los Usuarios será tratada conforme a nuestra Política de Privacidad. 
          El Usuario autoriza a ReservaTuCorte a utilizar sus datos para fines operativos y de mejora de la experiencia en la plataforma. 
          El Usuario podrá ejercer sus derechos de acceso, rectificación o supresión de sus datos conforme la Ley 25.326.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>8. Suspensión o Baja del Servicio</Text>
        <Text style={styles.paragraph}>
          ReservaTuCorte se reserva el derecho de suspender, limitar o cancelar el acceso al sitio a cualquier Usuario 
          que incumpla estos Términos y Condiciones, sin necesidad de previo aviso.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>9. Responsabilidad</Text>
        <Text style={styles.paragraph}>
          ReservaTuCorte no garantiza el acceso continuo e ininterrumpido del sitio, que puede verse afectado por factores ajenos. 
          La plataforma no se responsabiliza por interrupciones o fallas que impidan el acceso al sitio o la ejecución de reservas.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>10. Enlaces a Terceros</Text>
        <Text style={styles.paragraph}>
          El sitio puede contener enlaces a sitios web de terceros. 
          ReservaTuCorte no se hace responsable por el contenido ni las políticas de privacidad de dichos sitios.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
    textWrap: 'balance',
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
