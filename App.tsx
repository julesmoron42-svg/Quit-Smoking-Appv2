import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import des écrans
import MainTab from './src/screens/MainTab';
import ProfileTab from './src/screens/ProfileTab';
import AnalyticsTab from './src/screens/AnalyticsTab';
import SettingsTab from './src/screens/SettingsTab';

const Tab = createBottomTabNavigator();

export default function App() {
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