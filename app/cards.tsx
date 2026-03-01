import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'https://talkify.store/api';

type Category = {
  id: number;
  name: string;
};

export default function CardsScreen() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Activa');
  const [categories, setCategories] = useState<Category[]>([]);
  const pickerOptionColor = Platform.OS === 'android' ? '#111111' : '#FFFFFF';
  const pickerPlaceholderColor = Platform.OS === 'android' ? '#6B7280' : '#8EA0C1';

  const saveCard = async () => {
    if (!content.trim()) {
      alert('El contenido de la carta no puede estar vacío.');
      return;
    }
    if (!category) {
      alert('Por favor, seleccioná una categoría para la carta.');
      return;
    }
    console.log({
      content: content.trim(),
      category_id: parseInt(category, 10),
      status,
    });
    try {
      const response = await fetch(`${API_BASE_URL}/create_card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({  
          content: content.trim(),
          category_id: parseInt(category, 10),
          state: status,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo guardar la carta. Por favor, intentá nuevamente.');
      }
      alert('Carta guardada exitosamente.');
      setContent('');
      setCategory('');
      setStatus('Activa');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al guardar la carta',
        text2: error.message || 'Ocurrió un error al guardar la carta. Por favor, intentá nuevamente.',
      });
    }
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_categories`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'No se pudieron cargar las categorías.');
        }

        setCategories(Array.isArray(data?.categories) ? data.categories : []);
      } catch (error) {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>Crear carta</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardEyebrow}>NUEVA CARTA</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contenido</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={5}
              value={content}
              onChangeText={setContent}
              placeholder="Escribí el contenido de la carta..."
              placeholderTextColor="#6E7B99"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.selectField}>
              <Picker
                selectedValue={category}
                onValueChange={(value) => setCategory(String(value))}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
                mode="dropdown"
              >
                <Picker.Item label="Seleccioná categoría" value="" color={pickerPlaceholderColor} />
                {categories.map((item) => (
                  <Picker.Item key={item.id} label={item.name} value={String(item.id)} color={pickerOptionColor} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Estado</Text>
            <TouchableOpacity
              style={styles.selectField}
              activeOpacity={0.85}
              onPress={() => setStatus((prev) => (prev === 'active' ? 'active' : 'active'))}
            >
              <Text style={styles.selectText}>{status}</Text>
              <Ionicons name="chevron-down" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            activeOpacity={0.9}
            onPress={saveCard}>
            <Text style={styles.saveButtonText}>Guardar carta</Text>
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
    paddingTop: 40,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '700',
  },
});
