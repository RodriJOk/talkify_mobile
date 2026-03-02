import CustomBottomTabBar from '@/components/CustomBottomTabBar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useFonts } from 'expo-font';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Toast from 'react-native-toast-message';

// --- Contenido Personalizado del Drawer ---
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar la sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, cerrar sesión",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/singin');
            } catch (e) {
              console.error("Error al cerrar la sesión:", e);
              Alert.alert("Error", "No se pudo cerrar la sesión correctamente.");
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const drawerItems = React.useMemo(() => [
    {
      label: 'Jugar',
      route: '/play',
      icon: 'game-controller-outline',
    },
    {
      label: 'Cartas',
      route: '/new_cards',
      icon: 'albums-outline',
    },
    {
      label: 'Suscripcion',
      route: '/subscription',
      icon: 'card-outline',
    },
    {
      label: 'Configuracion',
      route: '/settings',
      icon: 'settings-outline',
    }
  ], []);

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={{ flex: 1}}> 
      <View style={{ flex: 1 }}>
        {drawerItems.map((item) => {
          // La pantalla está "enfocada" si la ruta actual (pathname) es la misma que la del item
          const isFocused = pathname === item.route;

          return (
            <DrawerItem
              key={item.label}
              label={item.label}
              focused={isFocused}
              onPress={() => router.push(item.route as any)}
              labelStyle={styles.drawerLabel}
              icon={({ color, size }) => (
                <Ionicons name={item.icon as any} size={size} color={color} />
              )}
            />
          );
        })}
      </View>
      <View style={[styles.logoutSection]}>
        <DrawerItem
          label="Cerrar Sesión"
          labelStyle={styles.logoutLabel}
          onPress={handleLogout}
          icon={({ size }) => (
            <Ionicons name="log-out-outline" size={size} color="#d9534f" />
          )}
        />
      </View>
    </DrawerContentScrollView>
  );
}


// --- Layout Principal de la App (Drawer) ---
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins-Light.ttf'),
  });

  const pathname = usePathname();
  
  // Pantallas donde NO queremos mostrar el bottom tab bar
  const hideTabBarScreens = ['/singin', '/register', '/forget_password', '/terms_and_conditions'];
  const shouldShowTabBar = !hideTabBarScreens.some(screen => pathname.startsWith(screen));

  // --- Configuración de RevenueCat (una sola vez al iniciar la app) ---
  useEffect(() => {
    const initRevenueCat = () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        const appEnv = 'production';

        const iosApiKey = 'appl_mTpdbKsVxQhYewwMFpifOTIjhKO';

        const androidApiKey = 'goog_BZzTuGaPdPVkvCZUpkXNyYPIeHd';

        const selectedApiKey = Platform.OS === 'ios' ? iosApiKey : androidApiKey;

        // Validar formato según entorno
        const isValidKey = Platform.OS === 'ios'
          ? selectedApiKey.startsWith('appl_')
          : selectedApiKey.startsWith('goog_');

        if (!selectedApiKey) {
          console.error('[RevenueCat] No hay API key configurada');
          return;
        }

        if (!isValidKey) {
          console.warn(
            `[RevenueCat] Key sospechosa para ${appEnv}: esperaba ${Platform.OS === 'ios' ? 'appl_' : 'goog_'} pero recibió ${selectedApiKey.substring(0, 5)}...`
          );
        }

        Purchases.configure({ apiKey: selectedApiKey });
        console.log(`[RevenueCat] ✅ Configurado para ${appEnv} (${Platform.OS}) con key ${selectedApiKey.substring(0, 8)}...`);
      } catch (error: any) {
        console.error('[RevenueCat] ❌ Error al inicializar:', error?.message || error);
      }
    };

    initRevenueCat();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: { backgroundColor: '#fff' },
            headerStyle: { backgroundColor: '#000a23' },
            headerTintColor: '#fff',
            drawerLabelStyle: { fontFamily: 'Poppins-Regular' }
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              title: 'Talkify'
            }}
          />
          <Drawer.Screen name="new_cards" options={{ title: 'Cartas' }} />
          <Drawer.Screen name="new_card_for_me" options={{ title: 'Carta para mí', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="new_card_for_game" options={{ title: 'Carta para el juego', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="play" options={{ title: 'Jugar' }} />
          <Drawer.Screen name="cards" options={{ title: 'Cartas' }} />
          <Drawer.Screen name="subscription" options={{ title: 'Suscripcion' }} />
          <Drawer.Screen name="settings" options={{ title: 'Configuracion' }} />
          <Drawer.Screen name="singin" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="forget_password" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="register" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="terms_and_conditions" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="+not-found" options={{ drawerItemStyle: { display: 'none' } }} />
          
          {/* Ejemplo: Si 'my_professionals' no está en tabs, debe declararse aquí para que la navegación funcione */}
          <Drawer.Screen name="my_professionals" options={{ title: 'Mis profesionales' }} />
          <Drawer.Screen name="my_profile" options={{ title: 'Mi Perfil' }} />
          <Drawer.Screen name="my_shift_reservations" options={{ title: 'Mis turnos' }} />
          <Drawer.Screen name="my_clients" options={{ title: 'Mis clientes' }} />
          <Drawer.Screen name="my_branches" options={{ title: 'Mis sucursales' }} />
          <Drawer.Screen name="my_services" options={{ title: 'Mis servicios' }} />
          <Drawer.Screen name="give_feedback" options={{ title: 'Dar feedback' }} />
          <Drawer.Screen name="qr_code" options={{ title: 'Código QR' }} />
          <Drawer.Screen name="my_coupons" options={{ title: 'Mis cupones' }} />
          <Drawer.Screen name="new_shift_reservation_client" options={{ title: 'Pedir un turno' }} />

          {/* Pantallas que se abren por navegación pero no se muestran en el drawer */}
          <Drawer.Screen name="edit_branch/[id]" options={{ title: 'Editar Sucursal', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="subscription_plans" options={{ title: 'Planes de suscripción', drawerItemStyle: { display: 'none' } }} />
        </Drawer>
        
        {/* Mostrar la barra de navegación inferior en todas las pantallas excepto login */}
        {shouldShowTabBar && <CustomBottomTabBar />}
      </View>
      <Toast />
    </GestureHandlerRootView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  drawerLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#333',
    padding: 0,
    margin: 0,
  },
  logoutSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 5,
  },
  logoutLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#d9534f',
  },
  versionContainer: {
    padding: 16,
    borderTopWidth: 0,
  },
  versionText: {
    fontSize: 14,
    color: '#888',
  },
});