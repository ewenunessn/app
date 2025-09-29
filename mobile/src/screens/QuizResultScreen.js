import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_CONFIG } from '../config';
import { useTheme } from '../hooks/useTheme';

export default function QuizResultScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { quiz, user, userAnswers, questions } = route.params;

  const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = percentage >= 60; // 60% para passar

  useEffect(() => {
    // Salvar resultado no servidor
    saveQuizResult();
  }, []);

  const saveQuizResult = async () => {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/api/quiz/${quiz.id}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          answers: userAnswers,
          score: percentage,
          completedAt: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
    }
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', title: 'Excelente!', message: 'Você é um expert no assunto!' };
    if (percentage >= 80) return { emoji: '🎉', title: 'Muito Bom!', message: 'Ótimo conhecimento!' };
    if (percentage >= 70) return { emoji: '👏', title: 'Bom!', message: 'Você está no caminho certo!' };
    if (percentage >= 60) return { emoji: '👍', title: 'Aprovado!', message: 'Continue estudando!' };
    return { emoji: '📚', title: 'Continue Aprendendo!', message: 'Não desista, você pode melhorar!' };
  };

  const performance = getPerformanceMessage();

  const handleFinish = () => {
    navigation.navigate('QuizList');
  };

  const handleRetry = () => {
    Alert.alert(
      'Refazer Quiz',
      'Deseja refazer este quiz?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: () => navigation.navigate('QuizPresentation', { quiz, user })
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient
          colors={passed ? [colors.primary, colors.primary] : ['#ff9800', '#f57c00']}
          style={styles.header}
        >
          <Text style={styles.resultIcon}>{performance.emoji}</Text>
          <Text style={styles.resultTitle}>{performance.title}</Text>
          <Text style={styles.resultSubtitle}>{performance.message}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Score Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Seu Desempenho</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreDetails}>
                {correctAnswers} de {totalQuestions} perguntas corretas
              </Text>
            </View>
            
            <View style={styles.scoreBar}>
              <View style={[
                styles.scoreBarFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: passed ? '#4CAF50' : '#ff9800'
                }
              ]} />
            </View>
          </View>

          {/* Quiz Info */}
          <View style={styles.quizCard}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizDescription}>{quiz.description}</Text>
            
            <View style={styles.quizStats}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📝</Text>
                <Text style={styles.statValue}>{totalQuestions}</Text>
                <Text style={styles.statLabel}>Perguntas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>✅</Text>
                <Text style={styles.statValue}>{correctAnswers}</Text>
                <Text style={styles.statLabel}>Acertos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>❌</Text>
                <Text style={styles.statValue}>{totalQuestions - correctAnswers}</Text>
                <Text style={styles.statLabel}>Erros</Text>
              </View>
            </View>
          </View>

          {/* Reward Card */}
          {passed && (
            <View style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>🎁</Text>
              <Text style={styles.rewardTitle}>Parabéns! Você ganhou um brinde!</Text>
              <Text style={styles.rewardMessage}>{quiz.rewardMessage}</Text>
              
              <View style={styles.rewardInstructions}>
                <Text style={styles.instructionsTitle}>Como resgatar:</Text>
                <Text style={styles.instructionsText}>
                  • Apresente esta tela em nossa loja{'\n'}
                  • Ou entre em contato conosco{'\n'}
                  • Válido por 30 dias
                </Text>
              </View>
            </View>
          )}

          {/* User Achievement */}
          <View style={styles.userCard}>
            <Text style={styles.userAvatar}>{user.avatar}</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userAchievement}>
                {passed ? 'Quiz concluído com sucesso!' : 'Quiz concluído - Continue praticando!'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>🔄 Refazer Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <LinearGradient
                colors={[colors.primary, colors.primary]}
                style={styles.finishButtonGradient}
              >
                <Text style={styles.finishButtonText}>✨ Finalizar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Thank You Message */}
          <View style={styles.thankYouCard}>
            <Text style={styles.thankYouTitle}>Obrigado por participar! 🙏</Text>
            <Text style={styles.thankYouText}>
              Esperamos que você tenha aprendido algo novo. Continue explorando nossos quizzes educativos!
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  scoreDetails: {
    fontSize: 16,
    color: '#666',
  },
  scoreBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  rewardCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#ffc107',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rewardIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 15,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
    marginBottom: 15,
  },
  rewardMessage: {
    fontSize: 16,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  rewardInstructions: {
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userAchievement: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 15,
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  retryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  finishButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  thankYouCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  thankYouTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 20,
  },
});