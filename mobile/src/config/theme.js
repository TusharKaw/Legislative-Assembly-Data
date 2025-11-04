import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    accent: '#03dac4',
    background: '#f0f2f5',
    surface: '#ffffff',
    text: '#1a1a1a',
    placeholder: '#757575',
    disabled: '#bdbdbd',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 12,
};

// For web, use localhost. For mobile, use IP address
export const API_URL = typeof window !== 'undefined' && window.location.origin.includes('localhost')
  ? 'http://127.0.0.1:5000/api'
  : __DEV__ 
  ? 'http://192.168.1.6:5000/api'
  : 'https://your-production-api.com/api';

