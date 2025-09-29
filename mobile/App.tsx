import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import UserRegistrationScreen from './src/screens/UserRegistrationScreen';
import { storageService } from './src/services/storage';
import { COLORS } from './src/theme';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { userId, userName, avatar } = await storageService.getUser();
      if (userId && userName) {
        setUser({ id: userId, name: userName, avatar });
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegistered = (userData) => {
    setUser(userData);
  };

  const handleUserLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔄</Text>
          <Text style={styles.loadingLabel}>Carregando...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      {user ? (
        <AppNavigator user={user} onLogout={handleUserLogout} />
      ) : (
        <UserRegistrationScreen onUserRegistered={handleUserRegistered} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    fontSize: 48,
    marginBottom: 10,
  },
  loadingLabel: {
    fontSize: 18,
    color: '#666',
  },
});
