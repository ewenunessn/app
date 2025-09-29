import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { API_CONFIG } from '../config';

export default function HomeScreen({ navigation, user }) {
  const { colors } = useTheme();
  const [featuredQuiz, setFeaturedQuiz] = useState(null);
  const [moreGames, setMoreGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFeaturedQuiz(),
        fetchMoreGames()
      ]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedQuiz = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz`);
      if (response.ok) {
        const quizzes = await response.json();
        if (quizzes.length > 0) {
          setFeaturedQuiz(quizzes[0]); // Primeiro quiz como destaque
        }
      }
    } catch (error) {
      console.error('Erro ao buscar quiz em destaque:', error);
    }
  };



  const fetchMoreGames = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz`);
      if (response.ok) {
        const quizzes = await response.json();
        
        // Pegar os 2 primeiros quizzes para "Mais Jogos"
        const gamesData = quizzes.slice(0, 2).map((quiz, index) => ({
          id: quiz.id,
          title: quiz.title,
          subtitle: `${quiz.question_count || quiz.questionCount || 10} Questões`,
          icon: index === 0 ? '⚔️' : '🧭',
          quiz: quiz,
          // Simular estatísticas baseadas no ID do quiz
          winRate: `${(quiz.id * 3.7) % 30 + 10}%`
        }));
        
        setMoreGames(gamesData);
      }
    } catch (error) {
      console.error('Erro ao buscar mais jogos:', error);
      // Fallback para dados padrão
      setMoreGames([
        {
          id: 1,
          title: 'Quiz Geral',
          subtitle: '10 Questões',
          icon: '⚔️',
          winRate: '24.7%',
          quiz: null
        },
        {
          id: 2,
          title: 'Quiz Avançado',
          subtitle: '15 Questões',
          icon: '🧭',
          winRate: '12.5%',
          quiz: null
        }
      ]);
    }
  };

  const handleQuizPress = (quiz) => {
    navigation.navigate('QuizPresentation', { quiz, user });
  };



  const handleMoreGamePress = (game) => {
    if (game.quiz) {
      navigation.navigate('QuizPresentation', { quiz: game.quiz, user });
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* Quiz em Destaque */}
          {featuredQuiz && (
            <TouchableOpacity 
              style={styles.featuredQuizCard}
              onPress={() => handleQuizPress(featuredQuiz)}
            >
              <View style={styles.featuredQuizContent}>
                <View style={styles.featuredQuizIcon}>
                  <Text style={styles.featuredQuizEmoji}>🎯</Text>
                </View>
                <View style={styles.featuredQuizInfo}>
                  <Text style={styles.featuredQuizTitle}>Quiz do Dia</Text>
                  <Text style={styles.featuredQuizSubtitle}>
                    {featuredQuiz.question_count || 10} Questões
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '60%' }]} />
                    </View>
                    <Text style={styles.progressText}>6/10</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <Text style={styles.playButtonIcon}>▶️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}



          {/* Seção Mais Jogos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mais Jogos</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.viewAllText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.gamesGrid}>
              {moreGames.map((game) => (
                <TouchableOpacity 
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() => handleMoreGamePress(game)}
                >
                  <View style={styles.gameIcon}>
                    <Text style={styles.gameEmoji}>{game.icon}</Text>
                  </View>
                  <Text style={styles.gameTitle} numberOfLines={2}>
                    {game.title}
                  </Text>
                  <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                  <View style={styles.gameStats}>
                    <Text style={styles.gameStatsText}>👑 {game.winRate}</Text>
                    <View style={styles.gamePlayButton}>
                      <Text style={styles.gamePlayIcon}>⚡</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* Se não houver quizzes suficientes, mostrar cards vazios */}
              {moreGames.length < 2 && (
                <TouchableOpacity 
                  style={[styles.gameCard, styles.emptyGameCard]}
                  onPress={() => navigation.navigate('CreateQuiz', { user })}
                >
                  <View style={styles.gameIcon}>
                    <Text style={styles.gameEmoji}>➕</Text>
                  </View>
                  <Text style={styles.gameTitle}>Criar Quiz</Text>
                  <Text style={styles.gameSubtitle}>Novo desafio</Text>
                  <View style={styles.gameStats}>
                    <Text style={styles.gameStatsText}>Começar</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
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

  featuredQuizCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  featuredQuizContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredQuizIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featuredQuizEmoji: {
    fontSize: 30,
  },
  featuredQuizInfo: {
    flex: 1,
  },
  featuredQuizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredQuizSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonIcon: {
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  gamesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  gameCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    width: '48%',
  },
  gameIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameEmoji: {
    fontSize: 24,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gameSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameStatsText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  gamePlayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamePlayIcon: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyGameCard: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});