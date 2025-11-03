import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './theme';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData, let browser set it with boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default api;

