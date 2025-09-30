import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { API_CONFIG } from '../config';

export default function HomeScreen({ navigation, user }) {
  const { colors } = useTheme();
  const [mainQuiz, setMainQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMainQuiz();
  }, []);

  const fetchMainQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/main-quiz`);
      if (response.ok) {
        const quiz = await response.json();
        setMainQuiz(quiz);
      }
    } catch (error) {
      console.error('Erro ao buscar quiz principal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPress = () => {
    if (mainQuiz) {
      navigation.navigate('QuizPresentation', { quiz: mainQuiz, user });
    } else {
      Alert.alert(
        'Nenhum Quiz Disponível',
        'Não há quiz principal configurado. Configure um quiz nas configurações.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Configurar', 
            onPress: () => navigation.navigate('Settings')
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header com perfil do usuário */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.avatar || '👤'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          </View>
        </View>

        {/* Conteúdo Central */}
        <View style={styles.centerContent}>
          {/* Logo/Ícone do App */}
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>🎯</Text>
          </View>

          {/* Título do Quiz */}
          {mainQuiz ? (
            <View style={styles.quizInfo}>
              <Text style={styles.quizTitle}>{mainQuiz.title}</Text>
              <Text style={styles.quizSubtitle}>
                {mainQuiz.question_count || 10} questões • Pronto para começar?
              </Text>
            </View>
          ) : (
            <View style={styles.quizInfo}>
              <Text style={styles.quizTitle}>Quiz Educativo</Text>
              <Text style={styles.quizSubtitle}>
                Nenhum quiz principal configurado
              </Text>
            </View>
          )}

          {/* Botão de Play Principal */}
          <TouchableOpacity 
            style={[
              styles.playButton,
              !mainQuiz && styles.playButtonDisabled
            ]}
            onPress={handlePlayPress}
          >
            <View style={styles.playButtonInner}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.playText}>
              {mainQuiz ? 'JOGAR' : 'CONFIGURAR'}
            </Text>
          </TouchableOpacity>

          {/* Informações adicionais */}
          {mainQuiz && (
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={styles.infoText}>~5 min</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🏆</Text>
                <Text style={styles.infoText}>Ganhe pontos</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🎁</Text>
                <Text style={styles.infoText}>Prêmios</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer com dica */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mainQuiz 
              ? 'Toque no botão para começar o quiz' 
              : 'Configure um quiz principal nas configurações'
            }
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appIconText: {
    fontSize: 60,
  },
  quizInfo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  quizTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  quizSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  playButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  playIcon: {
    fontSize: 40,
    color: '#FF6B35',
    marginLeft: 5, // Ajuste visual para centralizar o ícone
  },
  playText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});