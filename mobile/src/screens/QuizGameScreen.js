import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator, // Usado para um loading mais visual
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// O LinearGradient não está na imagem de referência, então foi removido para um design mais limpo.
// Se quiser manter, pode adicioná-lo novamente ao redor do container principal.
import { API_CONFIG } from '../config';
import { useTheme } from '../hooks/useTheme';

// Componente do Ícone, para manter o JSX principal limpo
const QuestionIcon = ({ icon }) => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>{icon || '🧠'}</Text>
  </View>
);

export default function QuizGameScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { quiz, user } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);

  // --- LÓGICA ORIGINAL (INTACTA) ---
  useEffect(() => {
    if (route.params?.questions) {
      setQuestions(route.params.questions);
      setCurrentQuestionIndex(route.params?.currentQuestionIndex || 0);
      setUserAnswers(route.params?.userAnswers || []);
      setHasAnswered(false);
      setLoading(false);
    } else {
      fetchQuestions();
    }
  }, [route.params]);

  useEffect(() => {
    setHasAnswered(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Sair do Quiz',
        'Tem certeza que deseja sair? Seu progresso será perdido.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sair', 
            style: 'destructive',
            onPress: () => navigation.navigate('QuizList')
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz/${quiz.id}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        throw new Error('Erro ao carregar perguntas');
      }
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as perguntas do quiz');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    if (hasAnswered) {
      return;
    }
    setHasAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    
    if (currentQuestion.question_type === 'multiple_choice') {
      isCorrect = answer === currentQuestion.correct_answer_index;
    } else {
      isCorrect = answer === currentQuestion.correct_answer;
    }
    
    const answerData = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect: isCorrect,
      timestamp: new Date().toISOString()
    };

    const newAnswers = [...userAnswers, answerData];
    setUserAnswers(newAnswers);

    setTimeout(() => {
      navigation.replace('QuizExplanation', {
        quiz,
        user,
        question: currentQuestion,
        userAnswer: answer,
        isCorrect,
        currentQuestionIndex,
        totalQuestions: questions.length,
        userAnswers: newAnswers,
        questions
      });
    }, 300);
  };
  // --- FIM DA LÓGICA ORIGINAL ---

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.infoText}>Carregando perguntas...</Text>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.infoText}>Nenhuma pergunta encontrada</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de Progresso (Restilizada) */}
      <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.quizWrapper}>
          <QuestionIcon icon={currentQuestion.question_icon} />
          
          {/* Card da Pergunta */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {currentQuestion.question}
            </Text>
          </View>

          {/* Container das Respostas */}
          <View style={styles.answersContainer}>
            {currentQuestion.question_type === 'multiple_choice' ? (
              currentQuestion.alternatives?.map((alternative, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.answerButton, hasAnswered && styles.disabledButton]}
                  onPress={() => handleAnswer(index)}
                  disabled={hasAnswered}
                >
                  <Text style={styles.answerLetter}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                  <Text style={styles.answerText}>
                    {alternative}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.answerButton, hasAnswered && styles.disabledButton]}
                  onPress={() => handleAnswer(true)}
                  disabled={hasAnswered}
                >
                  <Text style={styles.answerText}>Verdadeiro</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.answerButton, hasAnswered && styles.disabledButton]}
                  onPress={() => handleAnswer(false)}
                  disabled={hasAnswered}
                >
                  <Text style={styles.answerText}>Falso</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Info do Quiz (Mantido e Restilizado) */}
       <View style={styles.quizInfo}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.userInfo}>Jogando como: {user.name}</Text>
        </View>
    </SafeAreaView>
  );
}

// --- NOVA FOLHA DE ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b2d2d1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b2d2d1',
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
  },
  backButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    elevation: 2,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#033860',
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Centraliza o conteúdo principal
    alignItems: 'center',
    padding: 20,
  },
  quizWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -40, // Puxa o ícone para cima do card
    zIndex: 1, // Garante que o ícone fique na frente
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconText: {
    fontSize: 40,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    paddingTop: 60, // Espaço extra para o ícone que está sobreposto
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  answersContainer: {
    width: '100%',
  },
  answerButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  answerLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    width: 30,
    height: 30,
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quizInfo: {
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.7)',
  },
  userInfo: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
});