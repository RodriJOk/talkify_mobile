import CustomBottomTabBar from '@/components/CustomBottomTabBar';
import { getRevenueCatConfig, hasKnownRevenueCatKeyPrefix } from '@/constants/revenuecat';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { BlurView } from 'expo-blur';
import { useFonts } from 'expo-font';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useLayoutEffect } from 'react';
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
    { label: 'Home', route: '/', icon: 'home-outline' },
    { label: 'Jugar', route: '/play', icon: 'game-controller-outline' },
    { label: 'Cartas', route: '/new_cards', icon: 'albums-outline' },
    { label: 'Suscripcion', route: '/subscription', icon: 'card-outline' },
    { label: 'Configuracion', route: '/settings', icon: 'settings-outline' }
  ], []);

  return (
    <View style={{ flex: 1 }}> 
      <DrawerContentScrollView 
        {...props} 
        paddingTop={0}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 0 }}
        bounces={false}
        style={styles.drawerScroll}
      > 
        <View style={styles.drawerPanel}>
          {/* Capas de fondo extendidas a la izquierda para evitar el corte */}
          <BlurView
            style={styles.drawerPanelBlur}
            intensity={56}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
          />
          <View style={styles.drawerPanelOverlay} />
          <View style={styles.drawerPanelFogLayer} />
          
          <View style={styles.drawerItemsContainer}>
            {drawerItems.map((item) => {
              const isFocused = item.route === '/'
                ? pathname === '/' || pathname === '/(tabs)'
                : pathname === item.route;

              return (
                <DrawerItem
                  key={item.label}
                  label={item.label}
                  focused={isFocused}
                  onPress={() => router.push(item.route as any)}
                  labelStyle={styles.drawerLabel}
                  style={styles.drawerItem}
                  activeBackgroundColor="rgba(167, 139, 250, 0.24)"
                  inactiveBackgroundColor="transparent"
                  activeTintColor="#ffffff"
                  inactiveTintColor="#F5F3FF"
                  icon={({ color, size }) => (
                    <Ionicons name={item.icon as any} size={size} color={color} />
                  )}
                />
              );
            })}
          </View>

          <View style={styles.logoutSection}>
            <DrawerItem
              label="Cerrar Sesión"
              labelStyle={styles.logoutLabel}
              style={styles.logoutItem}
              onPress={handleLogout}
              activeBackgroundColor="rgba(252, 165, 165, 0.14)"
              inactiveBackgroundColor="transparent"
              activeTintColor="#FECACA"
              inactiveTintColor="#FCA5A5"
              icon={({ size }) => (
                <Ionicons name="log-out-outline" size={size} color="#FCA5A5" />
              )}
            />
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

// --- Layout Principal ---
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins-Light.ttf'),
  });

  const pathname = usePathname();
  const hideTabBarScreens = ['/singin', '/register', '/forget_password', '/terms_and_conditions'];
  const shouldShowTabBar = !hideTabBarScreens.some(screen => pathname.startsWith(screen));

  useLayoutEffect(() => {
    const initRevenueCat = () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        const { selectedApiKey } = getRevenueCatConfig();
        if (selectedApiKey) {
          Purchases.configure({ apiKey: selectedApiKey });
        }
      } catch (error: any) {
        console.error('[RevenueCat] Error:', error?.message);
      }
    };
    initRevenueCat();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#050A18' }}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: { backgroundColor: 'transparent', width: '86%' },
            overlayColor: 'rgba(2, 6, 23, 0.56)',
            headerStyle: { backgroundColor: '#000a23' },
            headerTintColor: '#fff',
          }}
        >
          <Drawer.Screen name="(tabs)" options={{ title: 'Talkify' }} />
          <Drawer.Screen name="new_cards" options={{ title: 'Cartas' }} />
          <Drawer.Screen name="play" options={{ title: 'Jugar' }} />
          <Drawer.Screen name="subscription" options={{ title: 'Suscripcion' }} />
          <Drawer.Screen name="settings" options={{ title: 'Configuracion' }} />
          <Drawer.Screen name="singin" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="register" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="forget_password" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="terms_and_conditions" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="new_card_for_me" options={{ title: 'Carta Personalizada' }} />
          <Drawer.Screen name="new_card_for_game" options={{ title: 'Carta para el Juego' }} />
        </Drawer>
        {shouldShowTabBar && <CustomBottomTabBar />}
      </View>
      <Toast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerScroll: {
    backgroundColor: 'transparent',
    // Sacamos el scroll de la vista para que no se vea el inicio del borde
    marginLeft: -50, 
    paddingLeft: 20,
  },
  drawerPanel: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: 'rgba(66, 72, 104, 0.76)',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 40,
    // Compensamos el margen negativo para que los items respiren
    paddingLeft: 25, 
  },
  drawerPanelBlur: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: -60, // Extendemos el desenfoque hacia la izquierda oculta
  },
  drawerPanelOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: -60,
    backgroundColor: 'rgba(45, 53, 79, 0.30)',
  },
  drawerPanelFogLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: -60,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
  },
  drawerItemsContainer: {
    flex: 1,
    gap: 6,
    paddingTop: 20,
  },
  drawerItem: {
    borderRadius: 16,
    marginRight: 10,
    marginVertical: 4,
  },
  drawerLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
    color: '#F5F3FF',
  },
  logoutSection: {
    marginTop: 'auto',
    paddingBottom: 4,
    marginRight: 10,
    marginBottom: 20,
  },
  logoutItem: {
    borderRadius: 16,
  },
  logoutLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FCA5A5',
  },
});