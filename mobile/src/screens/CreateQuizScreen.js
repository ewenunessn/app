import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_CONFIG } from '../config';
import { useTheme } from '../hooks/useTheme';

export default function CreateQuizScreen({ navigation, user }) {
  const { colors } = useTheme();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [rewardMessage, setRewardMessage] = useState('');
  const [questions, setQuestions] = useState([{
    id: 1,
    question: '',
    questionType: 'true_false', // 'true_false' ou 'multiple_choice'
    questionIcon: '🧠', // Ícone da pergunta
    correctAnswer: true, // Para verdadeiro/falso
    correctAnswerIndex: 0, // Para múltipla escolha
    alternatives: ['', '', '', ''], // Para múltipla escolha
    correctExplanation: '',
    incorrectExplanation: ''
  }]);

  // Lista de ícones disponíveis
  const availableIcons = [
    '🧠', '🎯', '📚', '🌟', '🎓', '💡', '🔬', '🌍',
    '♻️', '⚡', '🛍️', '🏠', '🚗', '🍎', '💻', '📱',
    '🎨', '🎵', '⚽', '🏆', '❤️', '🔥', '💰', '🌱'
  ];
  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: '',
      questionType: 'true_false',
      questionIcon: '🧠',
      correctAnswer: true,
      correctAnswerIndex: 0,
      alternatives: ['', '', '', ''],
      correctExplanation: '',
      incorrectExplanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    
    // Se mudou o tipo de pergunta, resetar campos específicos
    if (field === 'questionType') {
      if (value === 'multiple_choice') {
        updatedQuestions[index].alternatives = ['', '', '', ''];
        updatedQuestions[index].correctAnswerIndex = 0;
      } else {
        updatedQuestions[index].correctAnswer = true;
      }
    }
    
    setQuestions(updatedQuestions);
  };

  const updateAlternative = (questionIndex, alternativeIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].alternatives[alternativeIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
    }
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      Alert.alert('Erro', 'Por favor, insira o título do quiz');
      return false;
    }

    if (!quizDescription.trim()) {
      Alert.alert('Erro', 'Por favor, insira a descrição do quiz');
      return false;
    }

    if (!rewardMessage.trim()) {
      Alert.alert('Erro', 'Por favor, insira a mensagem de brinde');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        Alert.alert('Erro', `Por favor, preencha a pergunta ${i + 1}`);
        return false;
      }
      
      if (q.questionType === 'multiple_choice') {
        // Validar alternativas
        const filledAlternatives = q.alternatives.filter(alt => alt.trim() !== '');
        if (filledAlternatives.length < 2) {
          Alert.alert('Erro', `Por favor, preencha pelo menos 2 alternativas para a pergunta ${i + 1}`);
          return false;
        }
        
        // Verificar se a resposta correta está preenchida
        if (!q.alternatives[q.correctAnswerIndex] || !q.alternatives[q.correctAnswerIndex].trim()) {
          Alert.alert('Erro', `A alternativa marcada como correta na pergunta ${i + 1} está vazia`);
          return false;
        }
      }
      
      if (!q.correctExplanation.trim()) {
        Alert.alert('Erro', `Por favor, preencha a explicação da resposta correta para a pergunta ${i + 1}`);
        return false;
      }
      if (!q.incorrectExplanation.trim()) {
        Alert.alert('Erro', `Por favor, preencha a explicação da resposta incorreta para a pergunta ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quizTitle.trim(),
          description: quizDescription.trim(),
          rewardMessage: rewardMessage.trim(),
          questions: questions,
          createdBy: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar quiz');
      }

      Alert.alert(
        'Sucesso!',
        'Quiz criado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o quiz. Tente novamente.');
      console.error('Erro ao criar quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Criar Quiz</Text>
          <Text style={styles.headerSubtitle}>Configure seu quiz educativo</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quiz Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Quiz</Text>
            
            <Text style={styles.label}>Título do Quiz *</Text>
            <TextInput
              style={styles.input}
              value={quizTitle}
              onChangeText={setQuizTitle}
              placeholder="Ex: Quiz sobre Sustentabilidade"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={quizDescription}
              onChangeText={setQuizDescription}
              placeholder="Descreva sobre o que é o quiz..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Mensagem de Brinde *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={rewardMessage}
              onChangeText={setRewardMessage}
              placeholder="Ex: Parabéns! Você ganhou um desconto de 10% em nossos produtos sustentáveis!"
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>

          {/* Questions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Perguntas ({questions.length})</Text>
              <TouchableOpacity style={styles.addButton} onPress={addQuestion}>
                <Text style={styles.addButtonText}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>

            {questions.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Pergunta {index + 1}</Text>
                  {questions.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeQuestion(index)}
                    >
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.label}>Pergunta *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={question.question}
                  onChangeText={(text) => updateQuestion(index, 'question', text)}
                  placeholder="Digite a pergunta..."
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#999"
                />

                <View style={styles.iconSection}>
                  <Text style={styles.label}>Ícone da Pergunta</Text>
                  <View style={styles.selectedIconContainer}>
                    <Text style={styles.selectedIcon}>{question.questionIcon}</Text>
                    <Text style={styles.selectedIconLabel}>Ícone selecionado</Text>
                  </View>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.iconScrollView}
                  >
                    <View style={styles.iconGrid}>
                      {availableIcons.map((icon, iconIndex) => (
                        <TouchableOpacity
                          key={iconIndex}
                          style={[
                            styles.iconOption,
                            question.questionIcon === icon && styles.iconOptionSelected
                          ]}
                          onPress={() => updateQuestion(index, 'questionIcon', icon)}
                        >
                          <Text style={styles.iconOptionText}>{icon}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.questionTypeSection}>
                  <Text style={styles.label}>Tipo de Pergunta</Text>
                  <View style={styles.typeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        question.questionType === 'true_false' && styles.typeButtonActive
                      ]}
                      onPress={() => updateQuestion(index, 'questionType', 'true_false')}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        question.questionType === 'true_false' && styles.typeButtonTextActive
                      ]}>
                        Verdadeiro/Falso
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        question.questionType === 'multiple_choice' && styles.typeButtonActive
                      ]}
                      onPress={() => updateQuestion(index, 'questionType', 'multiple_choice')}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        question.questionType === 'multiple_choice' && styles.typeButtonTextActive
                      ]}>
                        Múltipla Escolha
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {question.questionType === 'true_false' ? (
                  <View style={styles.answerSection}>
                    <Text style={styles.label}>Resposta Correta</Text>
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>Falso</Text>
                      <Switch
                        value={question.correctAnswer}
                        onValueChange={(value) => updateQuestion(index, 'correctAnswer', value)}
                        trackColor={{ false: '#f44336', true: '#033860' }}
                      />
                      <Text style={styles.switchLabel}>Verdadeiro</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.alternativesSection}>
                    <Text style={styles.label}>Alternativas (máximo 4)</Text>
                    {question.alternatives.map((alternative, altIndex) => (
                      <View key={altIndex} style={styles.alternativeRow}>
                        <TouchableOpacity
                          style={[
                            styles.correctButton,
                            question.correctAnswerIndex === altIndex && styles.correctButtonActive
                          ]}
                          onPress={() => updateQuestion(index, 'correctAnswerIndex', altIndex)}
                        >
                          <Text style={[
                            styles.correctButtonText,
                            question.correctAnswerIndex === altIndex && styles.correctButtonTextActive
                          ]}>
                            {String.fromCharCode(65 + altIndex)}
                          </Text>
                        </TouchableOpacity>
                        
                        <TextInput
                          style={[styles.input, styles.alternativeInput]}
                          value={alternative}
                          onChangeText={(text) => updateAlternative(index, altIndex, text)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + altIndex)}`}
                          placeholderTextColor="#999"
                        />
                      </View>
                    ))}
                    <Text style={styles.alternativeHint}>
                      Toque na letra para marcar a resposta correta
                    </Text>
                  </View>
                )}

                <Text style={styles.label}>Explicação - Resposta Correta *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={question.correctExplanation}
                  onChangeText={(text) => updateQuestion(index, 'correctExplanation', text)}
                  placeholder="Explique por que a resposta está correta..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Explicação - Resposta Incorreta *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={question.incorrectExplanation}
                  onChangeText={(text) => updateQuestion(index, 'incorrectExplanation', text)}
                  placeholder="Explique por que a resposta está incorreta..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>
            ))}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateQuiz}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? 'Criando...' : 'Criar Quiz'}
            </Text>
          </TouchableOpacity>
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  addButton: {
    backgroundColor: '#033860',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  questionCard: {
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  answerSection: {
    marginVertical: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 15,
  },
  questionTypeSection: {
    marginVertical: 15,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  typeButtonActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#4CAF50',
  },
  alternativesSection: {
    marginVertical: 15,
  },
  alternativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  correctButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  correctButtonTextActive: {
    color: '#fff',
  },
  alternativeInput: {
    flex: 1,
    minHeight: 45,
  },
  alternativeHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  iconSection: {
    marginVertical: 15,
  },
  selectedIconContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  selectedIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  selectedIconLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  iconScrollView: {
    marginTop: 10,
  },
  iconGrid: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  iconOptionSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
    transform: [{ scale: 1.1 }],
  },
  iconOptionText: {
    fontSize: 24,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});