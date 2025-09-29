import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { API_CONFIG } from '../config';

export default function ExploreScreen({ navigation, user, route }) {
  const { colors } = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const category = route?.params?.category;

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (category && quizzes.length > 0) {
      filterQuizzesByCategory();
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [quizzes, category]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzesByCategory = () => {
    if (!category) {
      setFilteredQuizzes(quizzes);
      return;
    }

    const categoryName = category.name.toLowerCase();
    const filtered = quizzes.filter(quiz => {
      const title = quiz.title.toLowerCase();
      const description = quiz.description.toLowerCase();
      
      switch (categoryName) {
        case 'ciências':
          return title.includes('ciência') || title.includes('biologia') || 
                 title.includes('física') || title.includes('química') ||
                 description.includes('ciência') || description.includes('biologia');
        case 'história':
          return title.includes('história') || title.includes('histórico') ||
                 description.includes('história') || description.includes('histórico');
        case 'geografia':
          return title.includes('geografia') || title.includes('mundo') || 
                 title.includes('país') || description.includes('geografia');
        case 'matemática':
          return title.includes('matemática') || title.includes('número') || 
                 title.includes('cálculo') || description.includes('matemática');
        case 'literatura':
          return title.includes('literatura') || title.includes('livro') || 
                 title.includes('autor') || description.includes('literatura');
        default:
          return true;
      }
    });
    
    setFilteredQuizzes(filtered);
  };

  const handleQuizPress = (quiz) => {
    navigation.navigate('QuizPresentation', { quiz, user });
  };

  const renderQuizCard = ({ item, index }) => {
    const icons = ['🧠', '🎯', '📚', '🌟', '🎓', '💡', '🔬', '🌍'];
    const icon = icons[index % icons.length];

    return (
      <TouchableOpacity 
        style={styles.quizCard} 
        onPress={() => handleQuizPress(item)}
      >
        <View style={styles.quizIconContainer}>
          <Text style={styles.quizIcon}>{icon}</Text>
        </View>
        <View style={styles.quizInfo}>
          <Text style={styles.quizTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.quizDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.quizMeta}>
            <Text style={styles.quizQuestions}>
              {item.question_count || item.questionCount || 0} questões
            </Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>Médio</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {category ? `${category.name}` : 'Explorar Quizzes'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {category 
              ? `${filteredQuizzes.length} quiz(zes) encontrado(s)`
              : 'Descubra novos desafios'
            }
          </Text>
        </View>

        {/* Lista de Quizzes */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Carregando quizzes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredQuizzes}
            renderItem={renderQuizCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📚</Text>
                <Text style={styles.emptyTitle}>
                  {category 
                    ? `Nenhum quiz de ${category.name} encontrado`
                    : 'Nenhum quiz encontrado'
                  }
                </Text>
                <Text style={styles.emptyText}>
                  {category 
                    ? 'Tente outra categoria ou crie um novo quiz'
                    : 'Que tal criar o primeiro quiz?'
                  }
                </Text>
              </View>
            )}
          />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quizCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  quizIcon: {
    fontSize: 24,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizQuestions: {
    fontSize: 12,
    color: '#999',
  },
  difficultyBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});