import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { API_CONFIG } from '../config';

export default function ManageMainQuizScreen({ navigation, user }) {
  const { colors } = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [mainQuiz, setMainQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchQuizzes(),
        fetchMainQuiz()
      ]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar quizzes:', error);
    }
  };

  const fetchMainQuiz = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/main-quiz`);
      if (response.ok) {
        const data = await response.json();
        setMainQuiz(data);
      }
    } catch (error) {
      console.error('Erro ao buscar quiz principal:', error);
    }
  };

  const setAsMainQuiz = async (quizId) => {
    try {
      setUpdating(true);
      console.log('Definindo quiz principal:', quizId);
      console.log('URL:', `${API_CONFIG.BASE_URL}/api/quiz/${quizId}/set-main`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz/${quizId}/set-main`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const responseData = await response.text();
      console.log('Response data:', responseData);

      if (response.ok) {
        Alert.alert('Sucesso', 'Quiz principal definido com sucesso!');
        await fetchData(); // Recarregar dados
      } else {
        let errorMessage = 'Erro ao definir quiz principal';
        try {
          const errorData = JSON.parse(responseData);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Erro ${response.status}: ${responseData}`;
        }
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao definir quiz principal:', error);
      Alert.alert('Erro', `Erro de conexão: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const removeMainQuiz = async () => {
    Alert.alert(
      'Remover Quiz Principal',
      'Tem certeza que deseja remover o quiz principal? Nenhum quiz será exibido na tela inicial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const response = await fetch(`${API_CONFIG.BASE_URL}/api/main-quiz`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Sucesso', 'Quiz principal removido com sucesso!');
                await fetchData();
              } else {
                Alert.alert('Erro', 'Erro ao remover quiz principal');
              }
            } catch (error) {
              console.error('Erro ao remover quiz principal:', error);
              Alert.alert('Erro', 'Erro ao remover quiz principal');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleQuizPress = (quiz) => {
    Alert.alert(
      'Definir como Principal',
      `Deseja definir "${quiz.title}" como o quiz principal da tela inicial?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Definir', 
          onPress: () => setAsMainQuiz(quiz.id)
        }
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.container}>
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
    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Principal</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quiz Principal Atual */}
          {mainQuiz && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quiz Principal Atual</Text>
              <View style={styles.currentMainQuiz}>
                <View style={styles.quizIcon}>
                  <Text style={styles.quizEmoji}>🎯</Text>
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{mainQuiz.title}</Text>
                  <Text style={styles.quizSubtitle}>
                    {mainQuiz.question_count || 10} questões
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={removeMainQuiz}
                  disabled={updating}
                >
                  <Text style={styles.removeIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Lista de Quizzes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {mainQuiz ? 'Escolher Outro Quiz' : 'Escolher Quiz Principal'}
            </Text>
            
            {quizzes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>Nenhum quiz encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  Crie um quiz primeiro para defini-lo como principal
                </Text>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CreateQuiz', { user })}
                >
                  <Text style={styles.createButtonText}>Criar Quiz</Text>
                </TouchableOpacity>
              </View>
            ) : (
              quizzes.map((quiz) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={[
                    styles.quizCard,
                    quiz.is_main_quiz && styles.mainQuizCard
                  ]}
                  onPress={() => handleQuizPress(quiz)}
                  disabled={updating || quiz.is_main_quiz}
                >
                  <View style={styles.quizIcon}>
                    <Text style={styles.quizEmoji}>
                      {quiz.is_main_quiz ? '🎯' : '📝'}
                    </Text>
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    <Text style={styles.quizSubtitle}>
                      {quiz.question_count || 10} questões
                      {quiz.is_main_quiz && ' • Principal'}
                    </Text>
                  </View>
                  {!quiz.is_main_quiz && (
                    <View style={styles.selectButton}>
                      <Text style={styles.selectIcon}>→</Text>
                    </View>
                  )}
                  {quiz.is_main_quiz && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Atual</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {updating && (
          <View style={styles.updatingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.updatingText}>Atualizando...</Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  currentMainQuiz: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  quizCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainQuizCard: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  quizIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  quizEmoji: {
    fontSize: 24,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quizSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 16,
  },
  selectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  currentBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
  },
});