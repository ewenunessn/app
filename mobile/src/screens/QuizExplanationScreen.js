import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

export default function QuizExplanationScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { 
    quiz, 
    user, 
    question, 
    userAnswer, 
    isCorrect, 
    currentQuestionIndex, 
    totalQuestions, 
    userAnswers,
    questions 
  } = route.params;

  const handleNext = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      navigation.replace('QuizGame', {
        quiz,
        user,
        currentQuestionIndex: currentQuestionIndex + 1,
        userAnswers,
        questions
      });
    } else {
      navigation.replace('QuizResult', {
        quiz,
        user,
        userAnswers,
        questions
      });
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleNext();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);
  // --- FIM DA LÓGICA ORIGINAL ---

  // Variáveis para facilitar o uso no JSX
  const explanation = isCorrect ? question.correct_explanation : question.incorrect_explanation;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  // Cores dinâmicas baseadas no resultado
  const resultColor = isCorrect ? '#4CAF50' : '#F44336';
  const resultBackgroundColor = isCorrect ? '#E8F5E9' : '#FFEBEE';

  // Função para renderizar a resposta formatada
  const renderAnswer = (q, answerIndexOrValue) => {
    if (q.question_type === 'multiple_choice') {
      const letter = String.fromCharCode(65 + answerIndexOrValue);
      const text = q.alternatives[answerIndexOrValue];
      return `${letter} - ${text}`;
    }
    return answerIndexOrValue ? 'Verdadeiro' : 'Falso';
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header de Resultado */}
      <View style={[styles.header, { backgroundColor: resultColor }]}>
        <Text style={styles.resultIcon}>{isCorrect ? '✓' : '✗'}</Text>
        <Text style={styles.resultTitle}>
          {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card de Explicação e Revisão */}
        <View style={styles.card}>
          {/* Pergunta */}
          <Text style={styles.cardTitle}>A pergunta era:</Text>
          <Text style={styles.questionText}>{question.question}</Text>

          {/* Revisão das Respostas */}
          <View style={styles.answerReviewContainer}>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Sua resposta:</Text>
              <Text style={[styles.answerValue, { color: resultColor }]}>
                {renderAnswer(question, userAnswer)}
              </Text>
            </View>
            {!isCorrect && (
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Resposta correta:</Text>
                <Text style={[styles.answerValue, { color: '#4CAF50' }]}>
                  {renderAnswer(question, question.question_type === 'multiple_choice' ? question.correct_answer_index : question.correct_answer)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Explicação */}
          <View style={[styles.explanationBox, { backgroundColor: resultBackgroundColor, borderColor: resultColor }]}>
            <Text style={[styles.explanationTitle, { color: resultColor }]}>
              {isCorrect ? 'Entenda o porquê:' : 'Aprenda com o erro:'}
            </Text>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        </View>

        {/* Card de Progresso */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Seu progresso no quiz</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userAnswers.filter(a => a.isCorrect).length}</Text>
                <Text style={styles.statLabel}>Acertos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userAnswers.filter(a => !a.isCorrect).length}</Text>
                <Text style={styles.statLabel}>Erros</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round((userAnswers.filter(a => a.isCorrect).length / userAnswers.length) * 100)}%</Text>
                <Text style={styles.statLabel}>Aproveitamento</Text>
              </View>
            </View>
             <Text style={styles.progressText}>
              Pergunta {currentQuestionIndex + 1} de {totalQuestions}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
        </View>
      </ScrollView>

      {/* Botão de Próximo (Fixo) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex + 1 < totalQuestions ? 
              'Próxima Pergunta' : 
              'Ver Resultado Final'
            }
          </Text>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resultIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Espaço para o botão fixo
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  answerReviewContainer: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
  },
  answerValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10
  },
  explanationBox: {
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#033860',
    borderRadius: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fundo translúcido para ver o scroll
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nextButton: {
    backgroundColor: '#033860',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});