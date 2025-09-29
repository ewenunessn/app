import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_CONFIG } from '../config';
import { storageService } from '../services/storage';
import { useTheme } from '../hooks/useTheme';

const avatars = [
  { id: 'avatar1', name: 'Avatar 1', image: '🦊' },
  { id: 'avatar2', name: 'Avatar 2', image: '🦁' },
  { id: 'avatar3', name: 'Avatar 3', image: '🐼' },
  { id: 'avatar4', name: 'Avatar 4', image: '🐨' },
  { id: 'avatar5', name: 'Avatar 5', image: '🦄' },
  { id: 'avatar6', name: 'Avatar 6', image: '🐸' },
];

export default function UserRegistrationScreen({ onUserRegistered }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatars.find(a => a.id === selectedAvatar)?.image || '🦊'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }

      const user = await response.json();
      
      // Salvar usuário no AsyncStorage
      await storageService.saveUser(user.id, user.name, user.avatar);
      
      onUserRegistered(user);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao criar usuário. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[colors.primary, colors.primary]}
          style={styles.header}
        >
          <Text style={styles.title}>🎯 Quiz Online</Text>
          <Text style={styles.subtitle}>Bem-vindo! Vamos começar criando seu perfil.</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.label}>Seu Nome:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
            maxLength={50}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Escolha seu Avatar:</Text>
          <View style={styles.avatarSelection}>
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar.id && styles.selectedAvatar
                ]}
                onPress={() => setSelectedAvatar(avatar.id)}
              >
                <Text style={styles.avatarEmoji}>{avatar.image}</Text>
                <Text style={styles.avatarName}>{avatar.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Criando...' : 'Começar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 <Text style={styles.infoTextBold}>Dica:</Text> Use seu nome real para que seus amigos possam te reconhecer no ranking!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b2d2d1',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatarSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  avatarOption: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedAvatar: {
    borderColor: '#033860',
    backgroundColor: '#e8f4f8',
  },
  avatarEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  avatarName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#033860',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  infoTextBold: {
    fontWeight: 'bold',
  },
});