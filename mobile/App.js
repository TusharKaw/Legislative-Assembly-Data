import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import HomeScreen from './src/screens/HomeScreen';
import MemberDetailsScreen from './src/screens/MemberDetailsScreen';
import { theme } from './src/config/theme';

const Stack = createNativeStackNavigator();

export const AuthContext = createContext();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const login = async (token) => {
    await AsyncStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator>
            {isAuthenticated ? (
              <Stack.Screen 
                name="AdminDashboard" 
                component={AdminDashboard}
                options={{ title: 'Admin Dashboard' }}
              />
            ) : (
              <>
                <Stack.Screen 
                  name="Home" 
                  component={HomeScreen}
                  options={{ title: 'Delhi Legislative Council' }}
                />
                <Stack.Screen 
                  name="MemberDetails" 
                  component={MemberDetailsScreen}
                  options={{ title: 'Member Details' }}
                />
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen}
                  options={{ title: 'Admin Login' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AuthContext.Provider>
  );
}

