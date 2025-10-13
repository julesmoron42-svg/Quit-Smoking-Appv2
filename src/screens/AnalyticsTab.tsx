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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Line, Polyline, Text as SvgText, G, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { profileStorage, dailyEntriesStorage, settingsStorage, sessionStorage, goalsStorage } from '../lib/storage';
import { 
  calculateTheoreticalPlan, 
  getHealthBenefits, 
  updateUnlockedHealthBenefits,
  generateCigarettesChartData,
  generateSavingsChartData,
  calculateCigarettesAvoided,
  calculateMoneySaved
} from '../utils/calculations';
import { UserProfile, DailyEntry, AppSettings, HealthBenefit, FinancialGoal } from '../types';

const { width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

// Fonction pour créer un graphique SVG simple
const createSimpleChart = (data: any, width: number, height: number, period: string = '1M') => {
  const chartWidth = width - 40;
  const chartHeight = height - 40;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 20;
  
  // Vérifier que les données existent
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <Svg width={chartWidth} height={chartHeight}>
        <SvgText x={chartWidth/2} y={chartHeight/2} textAnchor="middle" fill="#94A3B8" fontSize="14">
          Aucune donnée disponible
        </SvgText>
      </Svg>
    );
  }
  
  // Trouver les valeurs min et max avec vérification
  const allValues = data.datasets.flatMap((dataset: any) => 
    dataset.data ? dataset.data.filter((val: any) => typeof val === 'number' && !isNaN(val)) : []
  );
  
  if (allValues.length === 0) {
    return (
      <Svg width={chartWidth} height={chartHeight}>
        <SvgText x={chartWidth/2} y={chartHeight/2} textAnchor="middle" fill="#94A3B8" fontSize="14">
          Aucune donnée valide
        </SvgText>
      </Svg>
    );
  }
  
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;
  
  // Fonction pour convertir les données en coordonnées SVG
  const getCoordinates = (dataset: any, color: string) => {
    if (!dataset.data || dataset.data.length === 0) {
      return { points: '', color };
    }
    
    const points = dataset.data
      .filter((value: any) => typeof value === 'number' && !isNaN(value))
      .map((value: number, index: number) => {
        const x = paddingLeft + (index / Math.max(dataset.data.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
        const y = paddingTop + ((maxValue - value) / range) * (chartHeight - paddingTop - paddingBottom);
        return `${x},${y}`;
      }).join(' ');
    return { points, color };
  };
  
  // Créer les lignes pour chaque dataset
  const lines = data.datasets
    .filter((dataset: any) => dataset.data && dataset.data.length > 0)
    .map((dataset: any, index: number) => {
      const color = index === 0 ? '#3B82F6' : '#10B981';
      const coords = getCoordinates(dataset, color);
      const strokeDasharray = index === 0 ? '5,5' : '0';
      
      // Ne pas afficher la ligne si pas de points valides
      if (!coords.points || coords.points.trim() === '') {
        return null;
      }
      
      return (
        <Polyline
          key={index}
          points={coords.points}
          fill="none"
          stroke={coords.color}
          strokeWidth={index === 0 ? 2 : 3}
          strokeDasharray={strokeDasharray}
        />
      );
    })
    .filter(Boolean); // Supprimer les éléments null
  
  // Créer les axes et labels (sans grille)
  const axisLabels = [];
  
  // Labels des valeurs Y (axe vertical)
  for (let i = 0; i <= 4; i++) {
    const y = paddingTop + (i / 4) * (chartHeight - paddingTop - paddingBottom);
    const value = maxValue - (i / 4) * range;
    
    axisLabels.push(
      <SvgText
        key={`label-y-${i}`}
        x={paddingLeft - 10}
        y={y + 4}
        textAnchor="end"
        fill="#94A3B8"
        fontSize="10"
      >
        {Math.round(value)}
      </SvgText>
    );
  }
  
  // Labels des dates (axe horizontal)
  if (data.datasets[0] && data.datasets[0].data) {
    const dataLength = data.datasets[0].data.length;
    const today = new Date();
    
    for (let i = 0; i < dataLength; i++) {
      const x = paddingLeft + (i / Math.max(dataLength - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
      
      // Afficher les dates (tous les 5 points pour éviter la surcharge)
      if (i % Math.max(Math.floor(dataLength / 5), 1) === 0) {
        const date = new Date(today);
        date.setDate(date.getDate() - (dataLength - 1 - i));
        const day = date.getDate();
        const month = date.getMonth() + 1;
        
        axisLabels.push(
          <SvgText
            key={`label-x-${i}`}
            x={x}
            y={chartHeight - paddingBottom + 15}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="9"
          >
            {`${day}/${month}`}
          </SvgText>
        );
      }
    }
  }
  
  // Axes principaux
  const axes = [
    // Axe Y (vertical)
    <Line
      key="axis-y"
      x1={paddingLeft}
      y1={paddingTop}
      x2={paddingLeft}
      y2={chartHeight - paddingBottom}
      stroke="#64748B"
      strokeWidth="2"
    />,
    // Axe X (horizontal)
    <Line
      key="axis-x"
      x1={paddingLeft}
      y1={chartHeight - paddingBottom}
      x2={chartWidth - paddingRight}
      y2={chartHeight - paddingBottom}
      stroke="#64748B"
      strokeWidth="2"
    />
  ];
  
  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Defs>
        <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
          <Stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
        </SvgLinearGradient>
      </Defs>
      {axes}
      {lines}
      {axisLabels}
    </Svg>
  );
};

// Écran Cigarettes avec graphique
function CigarettesScreen() {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
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



  // Calculer le nombre de jours selon la période
  const getDaysForPeriod = (period: string): number => {
    switch (period) {
      case '1M': return 30;
      case '6M': return 180;
      case '1Y': return 365;
      case '10Y': return 3650;
      default: return 30;
    }
  };

  // Fonction pour lisser les données avec une moyenne mobile
  const smoothData = (data: number[], windowSize: number = 7): number[] => {
    if (data.length <= windowSize) return data;
    
    const smoothed = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, start + windowSize);
      const window = data.slice(start, end);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      smoothed.push(average);
    }
    return smoothed;
  };

  const rawChartData = generateCigarettesChartData(profile, dailyEntries, getDaysForPeriod(selectedPeriod));
  
  // Appliquer le lissage pour les périodes longues
  let chartData = rawChartData;
  if (selectedPeriod !== '1M' && rawChartData.datasets) {
    chartData = {
      ...rawChartData,
      datasets: rawChartData.datasets.map((dataset: any) => ({
        ...dataset,
        data: smoothData(dataset.data, selectedPeriod === '6M' ? 7 : selectedPeriod === '1Y' ? 14 : 30)
      }))
    };
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Fond étoilé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 20 }).map((_, i) => {
            const positions = [
              { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
              { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
              { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
              { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 }
            ];
            
            const pos = positions[i % positions.length];
            const size = Math.random() * 3 + 2;
            
            return (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    left: pos.left + '%' as any,
                    top: pos.top + '%' as any,
                    width: size,
                    height: size,
                  },
                ]}
              />
            );
          })}
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>📊 Cigarettes</Text>
          <Text style={styles.screenDescription}>
            Évolution de votre consommation
          </Text>
          
          {/* Sélecteur de période */}
          <View style={styles.periodSelector}>
            {['1M', '6M', '1Y', '10Y'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Graphique */}
          <View style={styles.chartWrapper}>
            {createSimpleChart(chartData, width, 300)}
          </View>
            
            {/* Légende */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <Svg width={20} height={3}>
                  <Line
                    x1={0}
                    y1={1.5}
                    x2={20}
                    y2={1.5}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="3,3"
                  />
                </Svg>
                <Text style={styles.legendText}>Projection théorique</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: '#10B981', borderWidth: 0 }]} />
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
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

  // Calculer le nombre de jours selon la période
  const getDaysForPeriod = (period: string): number => {
    switch (period) {
      case '1M': return 30;
      case '6M': return 180;
      case '1Y': return 365;
      case '10Y': return 3650;
      default: return 30;
    }
  };

  // Fonction pour lisser les données avec une moyenne mobile
  const smoothData = (data: number[], windowSize: number = 7): number[] => {
    if (data.length <= windowSize) return data;
    
    const smoothed = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, start + windowSize);
      const window = data.slice(start, end);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      smoothed.push(average);
    }
    return smoothed;
  };

  const rawChartData = generateSavingsChartData(profile, dailyEntries, settings.pricePerCig, getDaysForPeriod(selectedPeriod));
  
  // Appliquer le lissage pour les périodes longues
  let chartData = rawChartData;
  if (selectedPeriod !== '1M' && rawChartData.datasets) {
    chartData = {
      ...rawChartData,
      datasets: rawChartData.datasets.map((dataset: any) => ({
        ...dataset,
        data: smoothData(dataset.data, selectedPeriod === '6M' ? 7 : selectedPeriod === '1Y' ? 14 : 30)
      }))
    };
  }


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Fond étoilé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 20 }).map((_, i) => {
            const positions = [
              { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
              { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
              { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
              { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 }
            ];
            
            const pos = positions[i % positions.length];
            const size = Math.random() * 3 + 2;
            
            return (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    left: pos.left + '%' as any,
                    top: pos.top + '%' as any,
                    width: size,
                    height: size,
                  },
                ]}
              />
            );
          })}
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>💰 Économies</Text>
          <Text style={styles.screenDescription}>
            Évolution cumulative de vos économies
          </Text>
          
          {/* Sélecteur de période */}
          <View style={styles.periodSelector}>
            {['1M', '6M', '1Y', '10Y'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Graphique */}
          <View style={styles.chartWrapper}>
            {createSimpleChart(chartData, width, 300)}
            
            {/* Légende */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <Svg width={20} height={3}>
                  <Line
                    x1={0}
                    y1={1.5}
                    x2={20}
                    y2={1.5}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="3,3"
                  />
                </Svg>
                <Text style={styles.legendText}>Économies théoriques</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: '#10B981', borderWidth: 0 }]} />
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
    
    // Mettre à jour le temps écoulé en temps réel
    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const benefits = getHealthBenefits();
    setHealthBenefits(benefits);
    await updateElapsedTime();
  };

  const updateElapsedTime = async () => {
    try {
      const sessionData = await sessionStorage.get();
      const now = Date.now();
      
      // Calculer le temps écoulé total comme dans MainTab
      const elapsedTime = sessionData.isRunning && sessionData.startTimestamp
        ? now - sessionData.startTimestamp + sessionData.elapsedBeforePause
        : sessionData.elapsedBeforePause;
        
      setSessionElapsed(elapsedTime);
    } catch (error) {
      console.error('Erreur lors du chargement de la session:', error);
      setSessionElapsed(0);
    }
  };

  const updatedBenefits = updateUnlockedHealthBenefits(healthBenefits, sessionElapsed);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Fond étoilé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 20 }).map((_, i) => {
            const positions = [
              { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
              { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
              { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
              { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 }
            ];
            
            const pos = positions[i % positions.length];
            const size = Math.random() * 3 + 2;
            
            return (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    left: pos.left + '%' as any,
                    top: pos.top + '%' as any,
                    width: size,
                    height: size,
                  },
                ]}
              />
            );
          })}
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>🏥 Bénéfices Santé</Text>
        <Text style={styles.screenDescription}>
          Vos progrès selon les données de l'Organisation Mondiale de la Santé
        </Text>
        
        {updatedBenefits.map((benefit) => {
          // Calculer le progrès en pourcentage (0-100)
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
          } else if (daysRemaining > 0) {
            timeRemainingText = `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`;
          } else {
            // Moins d'un jour restant, afficher en heures
            const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
            timeRemainingText = `${hoursRemaining} heure${hoursRemaining > 1 ? 's' : ''} restante${hoursRemaining > 1 ? 's' : ''}`;
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
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalPrice, setNewGoalPrice] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    startedSmokingYears: 0,
    cigsPerDay: 20,
    objectiveType: 'complete',
    reductionFrequency: 1,
  });
  const [dailyEntries, setDailyEntries] = useState<Record<string, DailyEntry>>({});
  const [settings, setSettings] = useState<AppSettings>({
    pricePerCig: 0.6,
    currency: '€',
    notificationsAllowed: true,
    language: 'fr',
    animationsEnabled: true,
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsData, profileData, entriesData, settingsData] = await Promise.all([
        goalsStorage.get(),
        profileStorage.get(),
        dailyEntriesStorage.get(),
        settingsStorage.get()
      ]);
      
      setGoals(goalsData);
      setProfile(profileData);
      setDailyEntries(entriesData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // Calculer le total des économies en utilisant les mêmes fonctions que MainTab
  const calculateTotalSavings = () => {
    const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries, 0);
    const totalSavings = calculateMoneySaved(cigarettesAvoided, settings.pricePerCig);
    return totalSavings;
  };

  // Calculer le pourcentage de progression pour un objectif
  const calculateProgressPercentage = (goalPrice: number, savings: number) => {
    return Math.min(100, (savings / goalPrice) * 100);
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim() || !newGoalPrice.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const price = parseFloat(newGoalPrice);
    if (isNaN(price) || price <= 0) {
      alert('Veuillez entrer un prix valide');
      return;
    }

    const newGoal: FinancialGoal = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      price: price,
      createdAt: new Date().toISOString(),
    };

    try {
      await goalsStorage.addGoal(newGoal);
      setGoals([...goals, newGoal]);
      setNewGoalTitle('');
      setNewGoalPrice('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'objectif:', error);
      alert('Erreur lors de l\'ajout de l\'objectif');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoalToDelete(goalId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    
    try {
      await goalsStorage.removeGoal(goalToDelete);
      setGoals(goals.filter(goal => goal.id !== goalToDelete));
      setShowDeleteConfirmation(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'objectif:', error);
      alert('Erreur lors de la suppression de l\'objectif');
    }
  };

  const cancelDeleteGoal = () => {
    setShowDeleteConfirmation(false);
    setGoalToDelete(null);
  };

  const totalSavings = calculateTotalSavings();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Fond étoilé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 20 }).map((_, i) => {
            const positions = [
              { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
              { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
              { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
              { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 }
            ];
            
            const pos = positions[i % positions.length];
            const size = Math.random() * 3 + 2;
            
            return (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    left: pos.left + '%' as any,
                    top: pos.top + '%' as any,
                    width: size,
                    height: size,
                  },
                ]}
              />
            );
          })}
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>🎯 Objectifs Financiers</Text>
        <Text style={styles.screenDescription}>
          Définissez des objectifs d'achat pour rester motivé
        </Text>

        {/* Affichage du total des économies */}
        <View style={styles.savingsSummary}>
          <Text style={styles.savingsTitle}>💰 Total économisé</Text>
          <Text style={styles.savingsAmount}>{totalSavings.toFixed(2)}{settings.currency}</Text>
        </View>
        
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
          <TouchableOpacity 
            style={[styles.addButton, (!newGoalTitle.trim() || !newGoalPrice.trim()) && styles.addButtonDisabled]}
            onPress={handleAddGoal}
            disabled={!newGoalTitle.trim() || !newGoalPrice.trim()}
          >
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
          goals.map((goal) => {
            const progressPercentage = calculateProgressPercentage(goal.price, totalSavings);
            const remainingAmount = Math.max(0, goal.price - totalSavings);
            const isCompleted = totalSavings >= goal.price;
            
            return (
              <View key={goal.id} style={[styles.goalCard, isCompleted && styles.goalCardCompleted]}>
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, isCompleted && styles.goalTitleCompleted]}>{goal.title}</Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteGoal(goal.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.goalPrice, isCompleted && styles.goalPriceCompleted]}>{goal.price}{settings.currency}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, progressPercentage)}%` }]} />
                </View>
                <Text style={[styles.progressText, isCompleted && styles.progressTextCompleted]}>
                  {isCompleted ? (
                    <>🎉 Objectif atteint ! ({totalSavings.toFixed(2)}{settings.currency} économisé)</>
                  ) : (
                    <>{progressPercentage.toFixed(1)}% - {totalSavings.toFixed(2)}{settings.currency} économisé sur {goal.price}{settings.currency}</>
                  )}
                </Text>
                {!isCompleted && (
                  <Text style={styles.remainingText}>
                    Il reste {remainingAmount.toFixed(2)}{settings.currency} à économiser
                  </Text>
                )}
              </View>
            );
          })
        )}
        </ScrollView>
      </LinearGradient>

      {/* Modal de confirmation de suppression */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDeleteGoal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteConfirmationContainer}>
            <Text style={styles.deleteConfirmationTitle}>🗑️ Supprimer l'objectif</Text>
            <Text style={styles.deleteConfirmationMessage}>
              Êtes-vous sûr de vouloir supprimer cet objectif ? Cette action est irréversible.
            </Text>
            <View style={styles.deleteConfirmationButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelDeleteGoal}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteGoal}
              >
                <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Composant principal avec navigation par onglets
export default function AnalyticsTab({ route }: any) {
  const tabNavigatorRef = React.useRef<any>(null);
  const initialRoute = route?.params?.initialRoute || 'Cigarettes';
  console.log('AnalyticsTab - initialRoute:', initialRoute);
  console.log('AnalyticsTab - route params:', route?.params);
  
  // Naviguer vers l'onglet spécifié quand le composant est monté
  React.useEffect(() => {
    if (route?.params?.initialRoute && tabNavigatorRef.current) {
      console.log('AnalyticsTab - Navigating to:', route.params.initialRoute);
      // Petit délai pour s'assurer que le navigateur est prêt
      setTimeout(() => {
        tabNavigatorRef.current?.navigate(route.params.initialRoute);
      }, 100);
    }
  }, [route?.params?.initialRoute]);
  
  return (
    <Tab.Navigator
      ref={tabNavigatorRef}
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  periodButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    height: 3,
    borderRadius: 1,
    borderWidth: 2,
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
  starryBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  // Styles pour les objectifs financiers
  savingsSummary: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
  },
  savingsTitle: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  savingsAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  goalForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalCardCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  goalTitleCompleted: {
    color: '#22C55E',
  },
  goalPrice: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  goalPriceCompleted: {
    color: '#22C55E',
  },
  progressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    height: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#3B82F6',
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  progressTextCompleted: {
    color: '#22C55E',
    fontWeight: '600',
  },
  remainingText: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#EF4444',
  },
  // Styles pour l'overlay de confirmation de suppression
  deleteConfirmationContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteConfirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteConfirmationMessage: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteConfirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  confirmDeleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});