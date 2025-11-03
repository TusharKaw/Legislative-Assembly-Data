import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    accent: '#03dac4',
    background: '#f5f5f5',
  },
};

// For web, use localhost. For mobile, use IP address
export const API_URL = typeof window !== 'undefined' && window.location.origin.includes('localhost')
  ? 'http://127.0.0.1:5000/api'
  : __DEV__ 
  ? 'http://192.168.1.6:5000/api'
  : 'https://your-production-api.com/api';

