import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthHeaders = {
  Authorization?: string;
};

export const buildAuthHeaders = (token?: string | null): AuthHeaders => {
  const normalizedToken = String(token ?? '').trim();

  if (!normalizedToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${normalizedToken}`,
  };
};

export const getAuthHeaders = async (): Promise<AuthHeaders> => {
  const token = await AsyncStorage.getItem('token');
  return buildAuthHeaders(token);
};
