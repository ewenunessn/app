import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

export default function QuizPresentationScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { quiz, user } = route.params;

  const handleStartQuiz = () => {
    // A navegação para 'QuizGame' foi mantida como no original
    navigation.navigate('QuizGame', { quiz, user });
  };
  // --- FIM DA LÓGICA ---

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Padronizado */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Prepare-se para o desafio!</Text>
        <Text style={styles.headerTitle} numberOfLines={2}>{quiz.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card Principal com todas as informações */}
        <View style={styles.contentCard}>
          {/* Seção Sobre */}
          <Text style={styles.sectionTitle}>Sobre este Quiz</Text>
          <Text style={styles.descriptionText}>{quiz.description}</Text>

          {/* Seção de Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{quiz.questionCount || 0}</Text>
              <Text style={styles.statLabel}>Perguntas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>~{(quiz.questionCount || 0) * 1} min</Text>
              <Text style={styles.statLabel}>Tempo Estimado</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🏆</Text>
              <Text style={styles.statLabel}>Recompensa</Text>
            </View>
          </View>

          {/* Seção de Instruções */}
          <Text style={styles.sectionTitle}>Como Funciona</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>Responda a cada pergunta com atenção.</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>Após cada resposta, você verá uma explicação para aprender mais.</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>Ao final, confira seu resultado e sua recompensa!</Text>
          </View>
        </View>
      </ScrollView>

      {/* Rodapé Fixo com Botão de Ação */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
          <Text style={styles.startButtonText}>🚀 Iniciar Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- NOVA FOLHA DE ESTILOS PADRONIZADA ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b2d2d1',
  },
  header: {
    backgroundColor: '#033860',
    padding: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.6)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Espaço para o botão flutuante no final da rolagem
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    width: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(240, 240, 240, 0.9)', // Fundo translúcido para ver o scroll
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  startButton: {
    backgroundColor: '#033860',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});