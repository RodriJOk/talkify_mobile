import CustomBottomTabBar from '@/components/CustomBottomTabBar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useFonts } from 'expo-font';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Alert, StyleSheet, View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

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
      route: '/cards',
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
          <Drawer.Screen name="play" options={{ title: 'Jugar' }} />
          <Drawer.Screen name="cards" options={{ title: 'Cartas' }} />
          <Drawer.Screen name="subscription" options={{ title: 'Suscripcion' }} />
          <Drawer.Screen name="settings" options={{ title: 'Configuracion' }} />
          <Drawer.Screen name="singin" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
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
          <Drawer.Screen name="new_branch" options={{ title: 'Nueva Sucursal', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="new_event/[id]" options={{ title: 'Reserva tu turno', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="edit_client/[id]" options={{ title: 'Editar Cliente', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="edit_service/[id]" options={{ title: 'Editar Servicio', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="new_service" options={{ title: 'Nuevo Servicio', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="edit_professional/[id]" options={{ title: 'Editar Profesional', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="new_professional" options={{ title: 'Nuevo Profesional', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_professional_availability/[id]" options={{ title: 'Disponibilidad horaria', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_professional_unavailability/[id]" options={{ title: 'Eventualidades/Inasistencias', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="new_client" options={{ title: 'Nuevo Cliente', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="new_coupon" options={{ title: 'Nuevo Cupón', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="edit_coupon/[id]" options={{ title: 'Editar Cupón', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="register" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="forget_password" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="terms_and_conditions" options={{ title: 'Términos y Condiciones', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="(tabs)/my_suscription" options={{ title: 'Mis suscripciones' }} />
          <Drawer.Screen name="(tabs)/my_calendar" options={{ title: 'Mi Calendario' }} />
          <Drawer.Screen name="(tabs)/my_shift_reservation" options={{ title: 'Mis turnos' }} />
          <Drawer.Screen name="(tabs)/index" options={{ title: 'Inicio' }} />
          <Drawer.Screen name="(tabs)/scan_qr" options={{ title: 'Escanear QR', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_shift_reservation_client" options={{ title: 'Mis turnos solicitados', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_calendar_collaborator" options={{ title: 'Mi Calendario', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_branch_collaborator" options={{ title: 'Mi Sucursal', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_professional_services" options={{ title: 'Mis Servicios', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_scheduler_collaborator" options={{ title: 'Mis Horarios', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="payment_settings" options={{ title: 'Configuración de Pago', drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="my_campaigns" options={{ title: 'Mis Campañas' }} />
          <Drawer.Screen name="new_campaigns" options={{ title: 'Nueva Campaña', drawerItemStyle: { display: 'none' } }} />
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