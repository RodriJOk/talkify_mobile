import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TermsSection = {
  heading: string;
  paragraph: string;
};

export default function TermsAndConditions() {
  const router = useRouter();
  const { t } = useTranslation();
  const sections = t('terms.sections', { returnObjects: true }) as TermsSection[];
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
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{t('terms.title')}</Text>

      {sections.map((section, index) => (
        <View style={styles.section} key={`${index}-${section.heading}`}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.paragraph}>{section.paragraph}</Text>
        </View>
      ))}
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
