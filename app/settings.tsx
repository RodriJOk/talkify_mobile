import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [confirmDeletePassword, setConfirmDeletePassword] = useState('');

  const isWideLayout = useMemo(() => width >= 980, [width]);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Campos incompletos', 'Completá todos los campos para continuar.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Contraseña inválida', 'La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    Alert.alert('Próximamente', 'La actualización de contraseña estará disponible en una próxima versión.');
  };

  const handleDeleteAccount = () => {
    if (!confirmDeletePassword) {
      Alert.alert('Confirmación requerida', 'Ingresá tu contraseña para eliminar la cuenta.');
      return;
    }

    Alert.alert('Próximamente', 'La eliminación de cuenta estará disponible en una próxima versión.');
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
          <Text style={styles.title}>Configuración</Text>
        </View>

        <View style={[styles.cardsWrapper, isWideLayout && styles.cardsWrapperWide]}>
          <View style={[styles.panelGlow, styles.passwordPanelGlow, isWideLayout && styles.leftPanel]}>
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>Cambiar contraseña</Text>
              <Text style={styles.panelDescription}>Actualizá tu contraseña para mantener tu cuenta segura.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña actual</Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nueva contraseña</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
                <TextInput
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleUpdatePassword} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#A855F7', '#4F46E5']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Guardar nueva contraseña</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.panelGlow, styles.deletePanelGlow, isWideLayout && styles.rightPanel]}>
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>Eliminar cuenta</Text>
              <Text style={styles.panelDescription}>Esta acción es irreversible. Se eliminará tu acceso y tu cuenta.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmá tu contraseña</Text>
                <TextInput
                  value={confirmDeletePassword}
                  onChangeText={setConfirmDeletePassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleDeleteAccount} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#FF2B4A', '#E10098']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Eliminar mi cuenta</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
