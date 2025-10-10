import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import des contextes et écrans
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import MainTab from './src/screens/MainTab';
import ProfileTab from './src/screens/ProfileTab';
import AnalyticsTab from './src/screens/AnalyticsTab';
import SettingsTab from './src/screens/SettingsTab';

const Tab = createBottomTabNavigator();

// Composant pour l'application principale avec navigation
function MainApp() {
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      setIsAuthenticated(true);
    } else if (!user && !loading) {
      setIsAuthenticated(false);
    }
  }, [user, loading]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#071033" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Accueil') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else if (route.name === 'Réglages') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: {
            backgroundColor: '#0F172A',
            borderTopColor: '#1E293B',
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 12,
            paddingTop: 12,
          },
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: '#071033',
            borderBottomColor: '#1E293B',
            borderBottomWidth: 1,
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="Accueil" 
          component={MainTab}
          options={{
            title: '🌱',
            headerTitle: '🌱 MyQuitZone',
          }}
        />
        <Tab.Screen 
          name="Profil" 
          component={ProfileTab}
          options={{
            title: '👤',
            headerTitle: '👤 Mon Profil',
          }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsTab}
          options={{
            title: '📊',
            headerTitle: '📊 Mes Statistiques',
          }}
        />
        <Tab.Screen 
          name="Réglages" 
          component={SettingsTab}
          options={{
            title: '⚙️',
            headerTitle: '⚙️ Paramètres',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Composant principal avec le provider d'authentification
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071033',
  },
});