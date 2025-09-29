import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_CONFIG } from '../config';
import { useTheme } from '../hooks/useTheme';

// Componente para o Card de Quiz, para manter o código da FlatList limpo
const QuizCard = ({ quiz, index, onPress }) => {
  const icons = ['🧠', '🎯', '📚', '🌟', '🎓', '💡', '🔬', '🌍'];
  const icon = icons[index % icons.length];

  return (
    <TouchableOpacity style={styles.quizCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quizIconContainer}>
        <Text style={styles.quizIcon}>{icon}</Text>
      </View>
      <Text style={styles.quizTitle} numberOfLines={3}>{quiz.title}</Text>
      <View style={styles.quizInfo}>
        <Text style={styles.quizInfoText}>{quiz.questionCount || 0} Perguntas</Text>
      </View>
    </TouchableOpacity>
  );
};

// Componente para a tela
export default function QuizListScreen({ navigation, user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // --- LÓGICA ORIGINAL (INTACTA, COM ADIÇÃO DE useCallback) ---
  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        throw new Error('Falha na resposta da rede');
      }
    } catch (error) {
      console.error('Erro ao buscar quizzes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os quizzes. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuizzes();
  }, []);

  const handleQuizPress = (quiz) => {
    navigation.navigate('QuizPresentation', { quiz, user });
  };

  const handleCreateQuiz = () => {
    navigation.navigate('CreateQuiz', { user });
  };
  // --- FIM DA LÓGICA ---

  const ListHeader = () => (
    <>
      {/* Simple Header with User Greeting */}
      <View style={styles.simpleHeader}>
        <Text style={styles.greetingText}>Olá, {user.name}!</Text>
        <Text style={styles.playText}>Vamos Jogar!</Text>
      </View>
      <Text style={styles.sectionTitle}>Quizzes Disponíveis</Text>
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#555" />
      ) : (
        <>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Nenhum quiz encontrado</Text>
          <Text style={styles.emptyText}>Seja o primeiro a criar um novo desafio!</Text>

        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={quizzes}
        renderItem={({ item, index }) => (
          <QuizCard
            quiz={item}
            index={index}
            onPress={() => handleQuizPress(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#555" />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        columnWrapperStyle={styles.columnWrapper}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={handleCreateQuiz}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- NOVA FOLHA DE ESTILOS PADRONIZADA ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b2d2d1', // Nova cor de background
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Novo header simples
  simpleHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greetingText: {
    fontSize: 24,
    color: '#666',
    marginBottom: 5,
  },
  playText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#033860',
  },
  settingsButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  settingsButtonText: {
    fontSize: 16,
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  // Botão flutuante
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#033860',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%', // Garante duas colunas com espaçamento
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  quizIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizIcon: {
    fontSize: 30,
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 45, // Garante alinhamento entre cards
  },
  quizInfo: {
    backgroundColor: '#FFD300',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  quizInfoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
}); 