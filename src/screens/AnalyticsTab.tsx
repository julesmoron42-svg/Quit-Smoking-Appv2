import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { profileStorage, dailyEntriesStorage, settingsStorage } from '../lib/storage';
import { 
  calculateTheoreticalPlan, 
  getHealthBenefits, 
  updateUnlockedHealthBenefits,
  generateCigarettesChartData,
  generateSavingsChartData
} from '../utils/calculations';
import { UserProfile, DailyEntry, AppSettings, HealthBenefit } from '../types';

const { width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

// Écran Cigarettes avec graphique
function CigarettesScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile>({
    startedSmokingYears: 0,
    cigsPerDay: 20,
    objectiveType: 'complete',
    reductionFrequency: 1,
  });
  const [dailyEntries, setDailyEntries] = useState<Record<string, DailyEntry>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Recharger les données quand l'écran devient visible
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const [profileData, entriesData] = await Promise.all([
      profileStorage.get(),
      dailyEntriesStorage.get(),
    ]);
    setProfile(profileData);
    setDailyEntries(entriesData);
  };



  const chartData = generateCigarettesChartData(profile, dailyEntries, 30);

  const chartConfig = {
    backgroundColor: 'rgba(7, 16, 51, 0.8)',
    backgroundGradientFrom: 'rgba(7, 16, 51, 0.8)',
    backgroundGradientTo: 'rgba(7, 16, 51, 0.8)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '8', // Points invisibles mais cliquables
      strokeWidth: '0',
      stroke: 'transparent',
      fill: 'transparent',
    },
    propsForLabels: {
      fontSize: 10,
    },
    propsForVerticalLabels: {
      fontSize: 10,
      dx: -10, // Décalage à gauche
    },
    propsForHorizontalLabels: {
      fontSize: 10,
      dy: 5,
    },
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.gradientContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>📊 Cigarettes</Text>
          <Text style={styles.screenDescription}>
            Évolution de votre consommation sur 30 jours
          </Text>
          
          {/* Graphique */}
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              segments={4}
              yAxisSuffix=""
              yAxisInterval={1}
              paddingLeft={20}
              paddingRight={5}
            />
          </View>
            
            {/* Légende */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { borderStyle: 'dashed', borderColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Projection théorique</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Consommation réelle</Text>
              </View>
            </View>

          
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Écran Économies avec graphique cumulatif
function SavingsScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile>({
    startedSmokingYears: 0,
    cigsPerDay: 20,
    objectiveType: 'complete',
    reductionFrequency: 1,
  });
  const [settings, setSettings] = useState<AppSettings>({
    pricePerCig: 0.6,
    currency: '€',
    notificationsAllowed: true,
    language: 'fr',
    animationsEnabled: true,
  });
  const [dailyEntries, setDailyEntries] = useState<Record<string, DailyEntry>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Recharger les données quand l'écran devient visible
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const [profileData, settingsData, entriesData] = await Promise.all([
      profileStorage.get(),
      settingsStorage.get(),
      dailyEntriesStorage.get(),
    ]);
    setProfile(profileData);
    setSettings(settingsData);
    setDailyEntries(entriesData);
  };

  const calculateTotalSavings = () => {
    const entries = Object.values(dailyEntries);
    let totalSavings = 0;
    
    entries.forEach(entry => {
      const theoreticalCigs = profile.cigsPerDay;
      const savedCigs = Math.max(0, theoreticalCigs - entry.realCigs);
      totalSavings += savedCigs * settings.pricePerCig;
    });
    
    return totalSavings;
  };

  const chartData = generateSavingsChartData(profile, dailyEntries, settings.pricePerCig, 30);

  const chartConfig = {
    backgroundColor: 'rgba(7, 16, 51, 0.8)',
    backgroundGradientFrom: 'rgba(7, 16, 51, 0.8)',
    backgroundGradientTo: 'rgba(7, 16, 51, 0.8)',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '0', // Pas de points
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.gradientContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>💰 Économies</Text>
          <Text style={styles.screenDescription}>
            Évolution cumulative de vos économies sur 30 jours
          </Text>
          
          {/* Graphique */}
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              segments={4}
            />
            
            {/* Légende */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { borderStyle: 'dashed', borderColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Économies théoriques</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Économies réelles</Text>
              </View>
            </View>
          </View>

          {/* Résumé des économies */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryAmount}>
                {calculateTotalSavings().toFixed(1)}€
              </Text>
              <Text style={styles.summaryLabel}>Total économisé</Text>
            </View>
          </View>
          
          {/* Statistiques détaillées */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profile.cigsPerDay}</Text>
              <Text style={styles.statLabel}>Cigarettes/jour</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{settings.pricePerCig}€</Text>
              <Text style={styles.statLabel}>Prix/cigarette</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Écran Santé
function HealthScreen() {
  const [healthBenefits, setHealthBenefits] = useState<HealthBenefit[]>([]);
  const [sessionElapsed, setSessionElapsed] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const benefits = getHealthBenefits();
    setHealthBenefits(benefits);
    
    // Simuler le temps écoulé (en réalité, récupérer depuis le session storage)
    setSessionElapsed(2 * 24 * 60 * 60 * 1000); // 2 jours pour l'exemple
  };

  const updatedBenefits = updateUnlockedHealthBenefits(healthBenefits, sessionElapsed);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.gradientContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>🏥 Bénéfices Santé</Text>
        <Text style={styles.screenDescription}>
          Vos progrès selon les données de l'Organisation Mondiale de la Santé
        </Text>
        
        {updatedBenefits.map((benefit) => {
          const progress = Math.min(100, (sessionElapsed / (benefit.timeRequired * 60 * 1000)) * 100);
          const timeRemaining = Math.max(0, benefit.timeRequired * 60 * 1000 - sessionElapsed);
          
          // Calculer le temps restant en format lisible
          const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
          const yearsRemaining = Math.floor(daysRemaining / 365);
          const remainingDays = daysRemaining % 365;
          
          let timeRemainingText = '';
          if (benefit.unlocked) {
            timeRemainingText = '✅ Atteint !';
          } else if (yearsRemaining > 0) {
            timeRemainingText = `${yearsRemaining} an${yearsRemaining > 1 ? 's' : ''} et ${remainingDays} jour${remainingDays > 1 ? 's' : ''} restant${yearsRemaining > 1 || remainingDays > 1 ? 's' : ''}`;
          } else {
            timeRemainingText = `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`;
          }

          return (
            <View
              key={benefit.id}
              style={[
                styles.healthCard,
                benefit.unlocked && styles.healthCardUnlocked,
              ]}
            >
              <View style={styles.healthHeader}>
                <Text style={[
                  styles.healthTitle,
                  benefit.unlocked && styles.healthTitleUnlocked,
                ]}>
                  {benefit.title}
                </Text>
                <Text style={styles.healthIcon}>
                  {benefit.unlocked ? '✅' : '⏳'}
                </Text>
              </View>
              <Text style={[
                styles.healthDescription,
                benefit.unlocked && styles.healthDescriptionUnlocked,
              ]}>
                {benefit.description}
              </Text>
              
              {/* Barre de progression */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` },
                      benefit.unlocked && styles.progressFillCompleted
                    ]} 
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={[
                    styles.progressPercentage,
                    benefit.unlocked && styles.progressPercentageCompleted
                  ]}>
                    {Math.round(progress)}%
                  </Text>
                  <Text style={[
                    styles.timeRemaining,
                    benefit.unlocked && styles.timeRemainingCompleted
                  ]}>
                    {timeRemainingText}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceText}>
            Source : Organisation Mondiale de la Santé (OMS)
          </Text>
          <TouchableOpacity 
            style={styles.sourceLink}
            onPress={() => {
              // Ouvrir le lien OMS dans le navigateur
              Linking.openURL('https://www.who.int/fr/news-room/questions-and-answers/item/tobacco-health-benefits-of-smoking-cessation');
            }}
          >
            <Text style={styles.sourceLinkText}>
              En savoir plus sur les bienfaits du sevrage tabagique
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Écran Objectifs
function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalPrice, setNewGoalPrice] = useState('');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.gradientContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>🎯 Objectifs Financiers</Text>
        <Text style={styles.screenDescription}>
          Définissez des objectifs d'achat pour rester motivé
        </Text>
        
        <View style={styles.goalForm}>
          <Text style={styles.formLabel}>Nouvel objectif</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: iPhone 15"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Prix (€)"
            value={newGoalPrice}
            onChangeText={setNewGoalPrice}
            keyboardType="numeric"
            placeholderTextColor="#64748B"
          />
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>➕ Ajouter l'objectif</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucun objectif défini pour le moment
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Ajoutez votre premier objectif pour commencer !
            </Text>
          </View>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalPrice}>{goal.price}€</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '0%' }]} />
              </View>
              <Text style={styles.progressText}>0% - 0€ économisé</Text>
            </View>
          ))
        )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Composant principal avec navigation par onglets
export default function AnalyticsTab({ route }: any) {
  const initialRoute = route?.params?.initialRoute || 'Cigarettes';
  
  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarIndicatorStyle: {
          backgroundColor: '#3B82F6',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Cigarettes" 
        component={CigarettesScreen}
        options={{ title: '🚬 Cigarettes' }}
      />
      <Tab.Screen 
        name="Économies" 
        component={SavingsScreen}
        options={{ title: '💰 Économies' }}
      />
      <Tab.Screen 
        name="Santé" 
        component={HealthScreen}
        options={{ title: '🏥 Santé' }}
      />
      <Tab.Screen 
        name="Objectifs" 
        component={GoalsScreen}
        options={{ title: '🎯 Objectifs' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  screenDescription: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  dataContainer: {
    marginBottom: 20,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  entryDate: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 5,
  },
  entryValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  entryGoal: {
    color: '#3B82F6',
    fontSize: 14,
  },
  summaryContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 20,
  },
  summaryAmount: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    color: '#3B82F6',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  healthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthCardUnlocked: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTitle: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  healthTitleUnlocked: {
    color: '#F8FAFC',
  },
  healthIcon: {
    fontSize: 20,
  },
  healthDescription: {
    color: '#64748B',
    fontSize: 14,
  },
  healthDescriptionUnlocked: {
    color: '#94A3B8',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressFillCompleted: {
    backgroundColor: '#10B981',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressPercentageCompleted: {
    color: '#10B981',
  },
  timeRemaining: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
  },
  timeRemainingCompleted: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  sourceContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  sourceText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  sourceLink: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  sourceLinkText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  goalForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  addButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  goalPrice: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  gradientContainer: {
    flex: 1,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 250,
    maxWidth: 300,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  popupDate: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  popupData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  popupLabel: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  popupValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  popupCloseButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  popupCloseText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '500',
  },
  chartPopup: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
  },
  simplePopup: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1000,
  },
  simplePopupText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});