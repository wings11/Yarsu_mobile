// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// export const getAuthToken = async () => {
//   return await SecureStore.getItemAsync('authToken');
// };

// export const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// api.interceptors.request.use(async (config) => {
//   const token = await getAuthToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });


import axios from 'axios';
import { getItem } from '@/utils/storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getItem('authToken');
  console.log("api - Retrieved authToken:", token); // Debug log
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});