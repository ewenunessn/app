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
  const [quizCategories, setQuizCategories] = useState([]);
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
        fetchQuizCategories(),
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

  const fetchQuizCategories = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz`);
      if (response.ok) {
        const quizzes = await response.json();
        
        // Criar categorias baseadas nos quizzes reais
        const categories = [
          { id: 1, name: 'Ciências', icon: '🔬', color: '#4CAF50', count: 0 },
          { id: 2, name: 'História', icon: '🏛️', color: '#FF9800', count: 0 },
          { id: 3, name: 'Geografia', icon: '🌍', color: '#2196F3', count: 0 },
          { id: 4, name: 'Matemática', icon: '📊', color: '#9C27B0', count: 0 },
          { id: 5, name: 'Literatura', icon: '📚', color: '#F44336', count: 0 },
        ];

        // Contar quizzes por categoria (baseado no título/descrição)
        quizzes.forEach(quiz => {
          const title = quiz.title.toLowerCase();
          const description = quiz.description.toLowerCase();
          
          if (title.includes('ciência') || title.includes('biologia') || title.includes('física') || title.includes('química')) {
            categories[0].count++;
          } else if (title.includes('história') || title.includes('histórico')) {
            categories[1].count++;
          } else if (title.includes('geografia') || title.includes('mundo') || title.includes('país')) {
            categories[2].count++;
          } else if (title.includes('matemática') || title.includes('número') || title.includes('cálculo')) {
            categories[3].count++;
          } else if (title.includes('literatura') || title.includes('livro') || title.includes('autor')) {
            categories[4].count++;
          }
        });

        setQuizCategories(categories);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      // Fallback para categorias padrão
      setQuizCategories([
        { id: 1, name: 'Ciências', icon: '🔬', color: '#4CAF50', count: 0 },
        { id: 2, name: 'História', icon: '🏛️', color: '#FF9800', count: 0 },
        { id: 3, name: 'Geografia', icon: '🌍', color: '#2196F3', count: 0 },
        { id: 4, name: 'Matemática', icon: '📊', color: '#9C27B0', count: 0 },
        { id: 5, name: 'Literatura', icon: '📚', color: '#F44336', count: 0 },
      ]);
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

  const handleCategoryPress = (category) => {
    navigation.navigate('Explore', { category });
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
                <Text style={styles.userLevel}>Expert</Text>
              </View>
            </View>
            <View style={styles.pointsContainer}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsIcon}>⚡</Text>
                <Text style={styles.pointsText}>1200</Text>
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

          {/* Seção de Categorias */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quiz</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.viewAllText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {quizCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {category.count > 0 && (
                    <Text style={styles.categoryCount}>{category.count}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

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
  userLevel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  pointsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
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
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
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