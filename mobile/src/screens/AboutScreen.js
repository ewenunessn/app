import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { APP_INFO } from '../config';

export default function AboutScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sobre</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Logo e Nome do App */}
          <View style={styles.appInfo}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>{APP_INFO.icon}</Text>
            </View>
            <Text style={styles.appName}>{APP_INFO.name}</Text>
            <Text style={styles.appVersion}>Versão {APP_INFO.version}</Text>
            <Text style={styles.appDescription}>{APP_INFO.description}</Text>
          </View>

          {/* Informações do Projeto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Sobre o Projeto</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Este aplicativo foi desenvolvido como projeto acadêmico para demonstrar 
                conhecimentos em desenvolvimento mobile com React Native.
              </Text>
            </View>
          </View>

          {/* Funcionalidades */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Funcionalidades</Text>
            <View style={styles.infoCard}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>Criar e jogar quizzes interativos</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>Sistema de pontuação e progresso</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <Text style={styles.featureText}>Interface moderna e intuitiva</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📱</Text>
                <Text style={styles.featureText}>Design responsivo e acessível</Text>
              </View>
            </View>
          </View>

          {/* Tecnologias */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛠️ Tecnologias</Text>
            <View style={styles.infoCard}>
              <View style={styles.techGrid}>
                <View style={styles.techItem}>
                  <Text style={styles.techName}>React Native</Text>
                  <Text style={styles.techDesc}>Framework Mobile</Text>
                </View>
                <View style={styles.techItem}>
                  <Text style={styles.techName}>Expo</Text>
                  <Text style={styles.techDesc}>Plataforma de Desenvolvimento</Text>
                </View>
                <View style={styles.techItem}>
                  <Text style={styles.techName}>Node.js</Text>
                  <Text style={styles.techDesc}>Backend API</Text>
                </View>
                <View style={styles.techItem}>
                  <Text style={styles.techName}>PostgreSQL</Text>
                  <Text style={styles.techDesc}>Banco de Dados</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Desenvolvedor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍💻 Desenvolvedor</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Desenvolvido por {APP_INFO.author} como projeto acadêmico.
              </Text>
              <Text style={styles.infoSubtext}>
                Demonstrando habilidades em desenvolvimento mobile, 
                design de interface e arquitetura de software.
              </Text>
            </View>
          </View>

          {/* Agradecimentos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🙏 Agradecimentos</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Obrigado por testar este aplicativo! Este projeto representa 
                o aprendizado e dedicação no desenvolvimento de soluções mobile.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Quiz Educativo
            </Text>
            <Text style={styles.footerSubtext}>
              Feito com ❤️ para aprendizado
            </Text>
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appIconText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  techItem: {
    width: '48%',
    marginBottom: 15,
  },
  techName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  techDesc: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});