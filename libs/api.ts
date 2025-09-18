import axios from 'axios';
import { Platform } from 'react-native';


export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ;

export const getAuthToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('authToken');
  }
  const SecureStore = await import('expo-secure-store');
  return await SecureStore.getItemAsync('authToken');
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});