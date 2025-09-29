import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

// Importe suas telas
import QuizListScreen from '../screens/QuizListScreen';
import CreateQuizScreen from '../screens/CreateQuizScreen';
import QuizPresentationScreen from '../screens/QuizPresentationScreen';
import QuizGameScreen from '../screens/QuizGameScreen';
import QuizExplanationScreen from '../screens/QuizExplanationScreen';
import QuizResultScreen from '../screens/QuizResultScreen';

// Novas telas
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Componente de navegação por abas
function TabNavigator({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        options={{
          tabBarLabel: 'Quiz',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color }}>🏠</Text>
            </View>
          ),
        }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Explore" 
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color }}>🏆</Text>
            </View>
          ),
        }}
      >
        {(props) => <ExploreScreen {...props} user={user} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Bookmarks" 
        options={{
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color }}>🔖</Text>
            </View>
          ),
        }}
      >
        {(props) => <ExploreScreen {...props} user={user} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Settings" 
        options={{
          tabBarLabel: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color }}>⚙️</Text>
            </View>
          ),
        }}
      >
        {(props) => <SettingsScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

/**
 * Componente de navegação principal do aplicativo.
 */
export default function AppNavigator({ user, onLogout }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {/* Navegação por abas como tela principal */}
        <Stack.Screen name="MainTabs">
          {(props) => <TabNavigator {...props} user={user} onLogout={onLogout} />}
        </Stack.Screen>

        {/* Tela de Criação de Quiz */}
        <Stack.Screen
          name="CreateQuiz"
          options={{
            headerShown: true,
            title: 'Criar Novo Quiz',
            headerStyle: { backgroundColor: '#033860' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {(props) => <CreateQuizScreen {...props} user={user} />}
        </Stack.Screen>

        {/* Tela Sobre */}
        <Stack.Screen name="About" component={AboutScreen} />

        {/* Fluxo do Quiz */}
        <Stack.Screen name="QuizPresentation" component={QuizPresentationScreen} />
        <Stack.Screen 
          name="QuizGame" 
          component={QuizGameScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="QuizExplanation" 
          component={QuizExplanationScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="QuizResult" 
          component={QuizResultScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}