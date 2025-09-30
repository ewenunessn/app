import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { storageService } from '../services/storage';

export default function SettingsScreen({ navigation, user, onLogout }) {
  const { colors } = useTheme();

  const handleCreateQuiz = () => {
    navigation.navigate('CreateQuiz', { user });
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await storageService.clearUser();
            onLogout();
          }
        }
      ]
    );
  };

  const handleManageMainQuiz = () => {
    navigation.navigate('ManageMainQuiz', { user });
  };

  const settingsOptions = [
    {
      id: 1,
      title: 'Criar Quiz',
      subtitle: 'Crie um novo quiz',
      icon: '➕',
      onPress: handleCreateQuiz,
      color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Quiz Principal',
      subtitle: 'Definir quiz da tela inicial',
      icon: '🎯',
      onPress: handleManageMainQuiz,
      color: '#FF9800'
    },
    {
      id: 3,
      title: 'Sobre',
      subtitle: 'Informações do app',
      icon: 'ℹ️',
      onPress: () => navigation.navigate('About'),
      color: '#607D8B'
    },
    {
      id: 4,
      title: 'Sair',
      subtitle: 'Fazer logout da conta',
      icon: '🚪',
      onPress: handleLogout,
      color: '#F44336'
    }
  ];

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header com perfil */}
        <View style={styles.header}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.avatar || '👤'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>Expert Level</Text>
            </View>
            <View style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </View>
          </View>
        </View>

        {/* Opções de configuração */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <View style={[styles.settingIcon, { backgroundColor: option.color }]}>
                <Text style={styles.settingEmoji}>{option.icon}</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Informações do app */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Quiz Educativo v1.0.0</Text>
          <Text style={styles.footerSubtext}>Desenvolvido para aprendizado</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 16,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  settingItem: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  settingArrow: {
    fontSize: 20,
    color: '#999',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});