import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// --- Configuración de Notificaciones ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const router = useRouter();
  
  // --- Estados ---
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const [userName, setUserName] = useState<string | null>(null);
  const [userSurname, setUserSurname] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false); // Flag para evitar recargas

  const handleRegistrationError = useCallback((errorMessage: string, type: 'success' | 'error' = 'error') => { 
    Toast.show({
      type: type,
      text1: type === 'error' ? 'Error' : 'Success',
      text2: errorMessage,
      visibilityTime: 3000,
      position: 'top',
    });
  }, []);

  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      // 1. Obtener estado de permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        // 2. Solicitar permisos si no están otorgados
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permisos denegados para notificaciones push', 'error');
        return;
      }
      
      // 3. Obtener Project ID (Necesario para getExpoPushTokenAsync)
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Ocurrió un error al obtener el ID del proyecto', 'error');
        return;
      }
      
      // 4. Obtener el token
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        handleRegistrationError(`Token de notificación push registrado`, 'success');
        return pushTokenString;
      } catch (e: any) {
        handleRegistrationError(`Error al obtener token push: ${e.message || e}`, 'error');
      }

    } else {
      handleRegistrationError('Debe usar un dispositivo físico para notificaciones push', 'error');
      return;
    }
  }, [handleRegistrationError]);

  const savePushTokenToServer = useCallback(async (notificationPushToken: string, userId: string) => {
    const currentAuthToken = await AsyncStorage.getItem('token'); // Obtener el token de autenticación
    
    if (!currentAuthToken) {
        handleRegistrationError('Token de autenticación faltante', 'error');
        return;
    }

    const data = {
      "expo_push_token": notificationPushToken,
      "id_user": userId
    }; 
    
    try {
      const response = await fetch('https://reservatucorte.com.ar/api/save_expo_push_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentAuthToken}`
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Error de servidor
        handleRegistrationError(responseData.message || 'Error al guardar token en servidor', 'error');
        return;
      }
      
      const userInfo = await AsyncStorage.getItem('user_information');
      if (userInfo) {
        const userObj = JSON.parse(userInfo);
        userObj.user.expo_push_token = notificationPushToken;
        await AsyncStorage.setItem('user_information', JSON.stringify(userObj));
      }
      
      handleRegistrationError('Token de notificación push guardado exitosamente', 'success');
    } catch (error: any) {
      handleRegistrationError(`Error de red al guardar token push: ${error.message || error}`, 'error');
    }
  }, [handleRegistrationError]);

  const registerForPushNotifications = useCallback(async (userId: string, userInfo: any) => {
    // 1. Obtener el token actual del dispositivo
    const notificationPushToken = await registerForPushNotificationsAsync();
    
    if (notificationPushToken) {
      setExpoPushToken(notificationPushToken);
      
      // 2. Comparar con el token que ya tenemos guardado localmente
      const savedToken = userInfo?.user?.expo_push_token;

      if (notificationPushToken !== savedToken) {
        await savePushTokenToServer(notificationPushToken, userId);
      } else {
        console.log('El token es el mismo. No hace falta actualizar el servidor.');
      }
    }
  }, [registerForPushNotificationsAsync, savePushTokenToServer]);


  // --- Función de Carga Inicial (solo una vez) ---
  const handleInitialLoad = useCallback(async () => {
    try {
      const user_information = await AsyncStorage.getItem('user_information');
      const currentToken = await AsyncStorage.getItem('token');
      
      if (!user_information || !currentToken) {
          router.replace('/singin');
          return;
      }

      const session = JSON.parse(user_information);
      const currentUserId = session.id || null;

      setUserName(session.name || null);
      setUserSurname(session.surname || null);
      setToken(currentToken);

      if (currentUserId) {
          await registerForPushNotifications(currentUserId, session); 
      }

      setIsInitialLoadDone(true);
    } catch (error: any) {
      handleRegistrationError(`Error crítico al cargar: ${error.message || error}`, 'error');
      router.replace('/singin');
    }
  }, [router, registerForPushNotifications, handleRegistrationError]);

  // --- Carga inicial solo una vez al montar ---
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = 'test_iwbkorYVRAiCefjPvnARnkNYeFY';
    const androidApiKey = 'test_iwbkorYVRAiCefjPvnARnkNYeFY';

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: iosApiKey});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: androidApiKey});
    }

    handleInitialLoad();

    // Configurar listeners de notificaciones 
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Tapped:', response);
    });

    // Limpiar listeners al desmontar
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []); // Solo ejecutar al montar

  // --- Recargar datos cuando la pantalla recibe foco (detecta cambios de sesión) ---
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        const user_information = await AsyncStorage.getItem('user_information');
        const currentToken = await AsyncStorage.getItem('token');
        
        if (!user_information || !currentToken) {
          setUserName(null);
          setUserSurname(null);
          setToken('');
          setIsInitialLoadDone(false);
          router.replace('/singin');
          return;
        }

        const session = JSON.parse(user_information);

        setUserName(session.name || null);
        setUserSurname(session.surname || null);
        setToken(currentToken);
      };

      refreshData();
    }, []) // Sin dependencias para que siempre ejecute
  );


  // 🔹 Navegación
  const handleNavigation = (path: string) => {
    (router.push as any)(path);
  };

  // 🔹 MenuItem
  const MenuItem = ({ icon, title, subtitle, onPress, count }: { icon: any; title: string; subtitle: string; onPress: () => void; count?: number }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemIconContainer}>
          {icon}
        </View>
        <View style={styles.menuItemTextContainer}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {count !== undefined && (
        <View style={styles.menuItemCountContainer}>
          <Text style={styles.menuItemCount}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            // source={userImage ? { uri: userImage } : require('@/assets/images/white_logo_transparent_background.png')}
            source={require('@/assets/images/neon_icon_small.png')}
            style={styles.userImage}
            resizeMode="contain"
          />
          <Text style={styles.userNameText}>
            {userName ? `Bienvenido, ${userName}` : 'Bienvenido a la aplicación'}
          </Text>
        </View>
        <View style={styles.menuContainer}>
          <MenuItem
            icon={<Ionicons name="person-outline" size={24} color="#000" />}
            title="Perfil"
            subtitle="Ajusta y cambia la configuración del perfil"
            onPress={() => handleNavigation('my_profile')}
          />
          <MenuItem
            icon={<Ionicons name="calendar-outline" size={24} color="#000" />}
            title="Jugar"
            subtitle="Gira la ruleta"
            onPress={() => handleNavigation('play')}
          />
          <Toast />
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#eee',
    fontFamily: 'Poppins-Regular',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    margin: 20,
    padding: 10,
    borderRadius: 10,
  },
  userImage: {
    padding: 0,
    margin: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userNameText: {
    color: '#000',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  menuContainer: {
    padding: 20,
  },
  shiftsContainer: {
    marginBottom: 20,
  },
  shiftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  shiftCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIconContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  menuItemCountContainer: {
    backgroundColor: '#007aff',
    borderRadius: 15,
    minWidth: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  menuItemCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});