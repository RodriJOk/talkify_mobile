import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomBottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = useMemo(() => [
    {
      name: 'play',
      route: '/play',
      icon: 'game-controller-outline',
      iconType: 'ionicons',
      title: 'Jugar',
    },
    {
      name: 'cards',
      route: '/cards',
      icon: 'clone',
      iconType: 'fontawesome',
      title: 'Cartas',
    },
    {
      name: 'subscription',
      route: '/subscription',
      icon: 'credit-card',
      iconType: 'fontawesome',
      title: 'Suscripcion',
    },
    {
      name: 'settings',
      route: '/settings',
      icon: 'settings-outline',
      iconType: 'ionicons',
      title: 'Configuracion',
    },
  ], []);

  const isActive = (route: string) => {
    return pathname === route || pathname.startsWith(route);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        const color = active ? '#fff' : '#8e8e93';

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
          >
            {tab.iconType === 'ionicons' ? (
              <Ionicons name={tab.icon as any} size={16} color={color} />
            ) : (
              <FontAwesome name={tab.icon as any} size={16} color={color} />
            )}
            <Text style={{ color, fontSize: 10, marginTop: 4 }}>{tab.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#000a23',
    borderTopWidth: 0,
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
