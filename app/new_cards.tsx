import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewCards() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>Crear carta</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            activeOpacity={0.85}
            onPress={() => router.push('/new_card_for_me')}
          >
            <Ionicons name="person" size={34} color="#FFFFFF" />
            <Text style={styles.optionText}>Para mí</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            activeOpacity={0.85}
            onPress={() => router.push('/new_card_for_game')}
          >
            <Ionicons name="game-controller" size={34} color="#FFFFFF" />
            <Text style={styles.optionText}>Para el juego</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A18',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  headerAccent: {
    width: 6,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#8B5CF6',
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
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  buttonsContainer: {
    gap: 16,
  },
  optionButton: {
    minHeight: 132,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#6D42D8',
    backgroundColor: '#0F1733',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 14,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
