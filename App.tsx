import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

// Import des contextes et écrans
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SubscriptionProviderMock as SubscriptionProvider } from './src/contexts/SubscriptionContextMock';
import { AICoachProvider } from './src/contexts/AICoachContext';
import { AuthScreen } from './src/screens/AuthScreen';
import MainTab from './src/screens/MainTab';
import AnalyticsTab from './src/screens/AnalyticsTab';
import QuitPlanTab from './src/screens/QuitPlanTab';
import PremiumTab from './src/screens/PremiumTab';
import SettingsTab from './src/screens/SettingsTab';
import HeaderLogo from './src/components/HeaderLogo';
import { notificationService, NotificationData } from './src/lib/notificationService';

const Tab = createBottomTabNavigator();

// Composant pour l'application principale avec navigation
function MainApp() {
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shouldOpenDailyEntry, setShouldOpenDailyEntry] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      setIsAuthenticated(true);
    } else if (!user && !loading) {
      setIsAuthenticated(false);
    }
  }, [user, loading]);

  // Configuration de la gestion des clics sur les notifications
  useEffect(() => {
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as unknown as NotificationData;
      
      if (data?.action === 'open_daily_entry') {
        console.log('🔔 Notification cliquée, ouverture de l\'overlay de saisie quotidienne');
        setShouldOpenDailyEntry(true);
      }
    };

    // Configurer le gestionnaire de notifications
    notificationService.setNotificationResponseHandler(handleNotificationResponse);

    return () => {
      // Cleanup si nécessaire
    };
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            let iconColor = color;

            if (route.name === 'Accueil') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else if (route.name === 'Plan de Sevrage') {
              iconName = focused ? 'flag' : 'flag-outline';
              // Couleurs inversées pour l'onglet Plan de Sevrage
              iconColor = focused ? '#1E293B' : '#64748B';
            } else if (route.name === 'Premium') {
              iconName = focused ? 'star' : 'star-outline';
            } else if (route.name === 'Réglages') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            // Créer un rond distinctif pour l'onglet Plan de Sevrage
            if (route.name === 'Plan de Sevrage') {
              return (
                <View style={styles.specialTabContainer}>
                  <View style={[
                    styles.specialTabCircle,
                    { backgroundColor: focused ? '#F8FAFC' : '#E2E8F0' }
                  ]}>
                    <Ionicons name={iconName} size={size} color={iconColor} />
                  </View>
                </View>
              );
            }

            return (
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={size} color={iconColor} />
              </View>
            );
          },
          tabBarActiveTintColor: '#8B5CF6',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#0a0a0a',
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 12,
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: '#0a0a0a',
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            borderBottomWidth: 1,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="Accueil" 
          options={{
            title: '🚬',
            headerTitle: () => <HeaderLogo title="MyQuitZone" />,
          }}
        >
          {(props) => (
            <MainTab 
              {...props} 
              shouldOpenDailyEntry={shouldOpenDailyEntry}
              onDailyEntryClosed={() => setShouldOpenDailyEntry(false)}
            />
          )}
        </Tab.Screen>
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsTab}
          options={{
            title: '🚬',
            headerTitle: () => <HeaderLogo title="Mes Statistiques" />,
          }}
        />
        <Tab.Screen 
          name="Plan de Sevrage" 
          component={QuitPlanTab}
          options={{
            title: '🚬',
            headerTitle: () => <HeaderLogo title="Mon Plan de Sevrage" />,
          }}
        />
        <Tab.Screen 
          name="Premium" 
          component={PremiumTab}
          options={{
            title: '🚬',
            headerTitle: () => <HeaderLogo title="Espace Sérénité" />,
          }}
        />
        <Tab.Screen 
          name="Réglages" 
          component={SettingsTab}
          options={{
            title: '🚬',
            headerTitle: () => <HeaderLogo title="Paramètres" />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Composant principal avec les providers
export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AICoachProvider>
          <MainApp />
        </AICoachProvider>
      </SubscriptionProvider>
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
  iconContainer: {
    marginTop: 2, // Remonte légèrement toutes les icônes
  },
  specialTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialTabCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8, // Position ajustée pour le rond
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#1E293B',
  },
});
