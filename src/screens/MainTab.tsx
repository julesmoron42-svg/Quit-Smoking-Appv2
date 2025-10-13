import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { sessionStorage, dailyEntriesStorage, streakStorage, profileStorage, settingsStorage } from '../lib/storage';
import { testUserDataSync } from '../lib/testSync';
import { testSupabaseConnection } from '../lib/testConnection';
import { 
  formatTime, 
  getBallColor, 
  getSeedState, 
  getProgressiveGoal,
  calculateValidStreak,
  calculateConnectionStreak,
  calculateSessionStreak,
  calculateCigarettesAvoided,
  calculateMoneySaved,
  getSeedProgress,
  checkAndResetStreak,
  getHealthBenefits,
  updateUnlockedHealthBenefits
} from '../utils/calculations';
import { TimerSession, DailyEntry, StreakData, UserProfile, AppSettings } from '../types';
import DailyEntryModal from '../components/DailyEntryModal';
import OnboardingModal, { OnboardingData } from '../components/OnboardingModal';

const { width } = Dimensions.get('window');

export default function MainTab() {
  const navigation = useNavigation() as any;
  const [session, setSession] = useState<TimerSession>({
    isRunning: false,
    startTimestamp: null,
    elapsedBeforePause: 0,
  });
  const [elapsed, setElapsed] = useState(0);
  const [dailyEntries, setDailyEntries] = useState<Record<string, DailyEntry>>({});
  const [streak, setStreak] = useState<StreakData>({ lastDateConnected: '', currentStreak: 0 });
  const [profile, setProfile] = useState<UserProfile>({
    startedSmokingYears: 0,
    cigsPerDay: 20,
    objectiveType: 'complete',
    reductionFrequency: 1,
    onboardingCompleted: false, // Explicitement défini à false par défaut
  });
  const [settings, setSettings] = useState<AppSettings>({
    pricePerCig: 0.6,
    currency: '€',
    notificationsAllowed: true,
    language: 'fr',
    animationsEnabled: true,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [onboardingVisible, setOnboardingVisible] = useState(false);


  useEffect(() => {
    loadData();
  }, []);

  // Vérifier si l'onboarding est nécessaire
  useEffect(() => {
    // Vérifier seulement après que les données ont été chargées
    if (profile && profile.onboardingCompleted === false) {
      setOnboardingVisible(true);
    } else if (profile && profile.onboardingCompleted === true) {
      setOnboardingVisible(false);
    }
  }, [profile.onboardingCompleted]);

  // Pas de reset automatique du streak au chargement
  // Le streak est géré uniquement lors de la saisie des entrées quotidiennes
  // Cela évite les pertes de streak non désirées

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session.isRunning && session.startTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsedTime = now - session.startTimestamp! + session.elapsedBeforePause;
        setElapsed(elapsedTime);
      }, 1000);
    } else {
      setElapsed(session.elapsedBeforePause);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session]);

  const getCurrentHealthBenefits = () => {
    const defaultBenefits = getHealthBenefits();
    
    // Mettre à jour les bienfaits en fonction du temps écoulé actuel (en millisecondes)
    return defaultBenefits.map(benefit => ({
      ...benefit,
      unlocked: elapsed >= benefit.timeRequired * 60 * 1000,
      unlockedAt: elapsed >= benefit.timeRequired * 60 * 1000 ? new Date().toISOString() : undefined,
      progress: Math.min(100, (elapsed / (benefit.timeRequired * 60 * 1000)) * 100),
    }));
  };

  const loadData = async () => {
    try {
      const [sessionData, entriesData, streakData, profileData, settingsData] = await Promise.all([
        sessionStorage.get(),
        dailyEntriesStorage.get(),
        streakStorage.get(),
        profileStorage.get(),
        settingsStorage.get(),
      ]);
      
      setSession(sessionData);
      setDailyEntries(entriesData);
      setSettings(settingsData);
      
      // Gérer le profil avec une valeur par défaut si pas encore créé
      const defaultProfile: UserProfile = {
        startedSmokingYears: 0,
        cigsPerDay: 20,
        objectiveType: 'complete',
        reductionFrequency: 1,
        onboardingCompleted: false,
      };
      
      // Si on a un profil existant, vérifier s'il a des données d'onboarding
      if (profileData) {
        // Si le profil a des données d'onboarding mais onboardingCompleted n'est pas défini,
        // on considère qu'il a été complété
        if (profileData.smokingYears !== undefined && profileData.onboardingCompleted === undefined) {
          profileData.onboardingCompleted = true;
          // Sauvegarder le profil mis à jour
          await profileStorage.set(profileData);
        }
        setProfile(profileData);
      } else {
        setProfile(defaultProfile);
      }

      // Recalculer le streak basé sur les entrées existantes (sans reset)
      if (Object.keys(entriesData).length > 0) {
        const sortedDates = Object.keys(entriesData).sort().reverse();
        const lastEntryDate = sortedDates[0];
        
        // Utiliser le streak basé sur les connexions (entrées quotidiennes)
        const connectionStreak = calculateConnectionStreak(entriesData, lastEntryDate);
        
        const updatedStreak: StreakData = {
          lastDateConnected: lastEntryDate,
          currentStreak: connectionStreak,
        };
        setStreak(updatedStreak);
      } else {
        setStreak(streakData);
      }

      // Les bienfaits santé sont calculés en temps réel basés sur le compteur

      // Calculer le temps écoulé basé sur la session
      const now = Date.now();
      const elapsedTime = sessionData.isRunning && sessionData.startTimestamp
        ? now - sessionData.startTimestamp + sessionData.elapsedBeforePause
        : sessionData.elapsedBeforePause;

      setElapsed(elapsedTime);

      // L'onboarding sera géré par le useEffect dédié
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };


  const handleStart = async () => {
    const now = Date.now();
    const newSession: TimerSession = {
      isRunning: true,
      startTimestamp: now,
      elapsedBeforePause: session.elapsedBeforePause,
    };
    
    setSession(newSession);
    await sessionStorage.set(newSession);
  };

  const handleRestart = async () => {
    Alert.alert(
      'Redémarrer',
      'Êtes-vous sûr de vouloir redémarrer le chronomètre ? Tous vos progrès santé seront remis à zéro.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Redémarrer',
          style: 'destructive',
          onPress: async () => {
            const newSession: TimerSession = {
              isRunning: false,
              startTimestamp: null,
              elapsedBeforePause: 0,
            };
            
            setSession(newSession);
            setElapsed(0);
            await sessionStorage.set(newSession);
            
            // Afficher un message de confirmation
            Alert.alert(
              'Chronomètre redémarré',
              'Votre chronomètre a été remis à zéro. Tous vos bénéfices santé ont été réinitialisés.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleDailyEntry = (dayIndex: number) => {
    const days = getSevenDaysData();
    const selectedDay = days[dayIndex];
    
    // Vérifier si c'est un jour futur
    const today = new Date().toISOString().split('T')[0];
    if (selectedDay.date > today) {
      Alert.alert(
        'Jour futur',
        'Vous ne pouvez pas saisir d\'entrée pour un jour futur. Connectez-vous chaque jour pour suivre votre progression ! 🌱',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedDate(selectedDay.date);
    setModalVisible(true);
  };

  const handleSaveEntry = async (entry: DailyEntry) => {
    try {
      const newEntries = { ...dailyEntries, [entry.date]: entry };
      setDailyEntries(newEntries);
      await dailyEntriesStorage.set(newEntries);
      
      // Recalculer le streak basé sur les connexions (entrées quotidiennes)
      const connectionStreak = calculateConnectionStreak(newEntries, entry.date);
      const newStreakData: StreakData = {
        lastDateConnected: entry.date,
        currentStreak: connectionStreak,
      };
      
      setStreak(newStreakData);
      await streakStorage.set(newStreakData);
      
      // Afficher un message de confirmation avec les statistiques mises à jour
      const cigarettesAvoided = calculateCigarettesAvoided(profile, newEntries, elapsed);
      const moneySaved = calculateMoneySaved(cigarettesAvoided, settings.pricePerCig);
      
      console.log('Nouvelles statistiques après entrée:', {
        date: entry.date,
        realCigs: entry.realCigs,
        goalCigs: entry.goalCigs,
        objectiveMet: entry.objectiveMet,
        cigarettesAvoided,
        moneySaved,
        streak: newStreakData.currentStreak
      });
      
      // Afficher un résumé des statistiques
      const dailyAvoided = Math.max(0, profile.cigsPerDay - entry.realCigs);
      const dailySaved = dailyAvoided * settings.pricePerCig;
      
      Alert.alert(
        'Entrée enregistrée !',
        `Aujourd'hui : ${dailyAvoided} cigarette${dailyAvoided > 1 ? 's' : ''} évitée${dailyAvoided > 1 ? 's' : ''} (${dailySaved.toFixed(1)}€ économisé${dailySaved > 1 ? 's' : ''})\n\nTotal : ${cigarettesAvoided} cigarettes évitées, ${moneySaved.toFixed(1)}€ économisés`,
        [{ text: 'Parfait !', style: 'default' }]
      );
      
      setModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les données');
    }
  };

  const handleOnboardingComplete = async (onboardingData: OnboardingData) => {
    try {
      // Mettre à jour le profil avec les données d'onboarding
      const updatedProfile: UserProfile = {
        ...profile,
        smokingYears: onboardingData.smokingYears,
        smokingPeakTime: onboardingData.smokingPeakTime,
        mainGoal: onboardingData.mainGoal,
        mainMotivation: onboardingData.mainMotivation,
        previousAttempts: onboardingData.previousAttempts,
        smokingTriggers: onboardingData.smokingTriggers,
        smokingSituations: onboardingData.smokingSituations,
        onboardingCompleted: true,
        // Mettre à jour les valeurs existantes avec les nouvelles données
        cigsPerDay: onboardingData.cigsPerDay,
        startedSmokingYears: onboardingData.smokingYears,
        // Définir l'objectif basé sur la réponse
        objectiveType: onboardingData.mainGoal === 'complete_stop' ? 'complete' : 'progressive',
        // Ajouter les nouvelles données d'objectif
        targetDate: onboardingData.targetDate,
      };
      
      setProfile(updatedProfile);
      await profileStorage.set(updatedProfile);
      setOnboardingVisible(false);
      
      Alert.alert(
        'Profil créé !',
        'Votre profil personnalisé a été créé avec succès. Vous êtes maintenant prêt à commencer votre parcours ! 🌱',
        [{ text: 'Commencer', style: 'default' }]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder votre profil');
    }
  };

  const getSevenDaysData = () => {
    const days = [];
    
    // Trouver le premier jour (jour 1) - la première entrée dans dailyEntries
    const sortedDates = Object.keys(dailyEntries).sort();
    let firstDay: Date;
    
    if (sortedDates.length === 0) {
      // Si aucune entrée, considérer aujourd'hui comme le jour 1
      firstDay = new Date();
    } else {
      firstDay = new Date(sortedDates[0]);
    }
    
    // Toujours afficher 7 jours, en commençant par le jour 1
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const entry = dailyEntries[dateString];
      
      // Calculer l'objectif pour ce jour (jour 1, 2, 3, etc.)
      const dayNumberFromStart = i + 1;
      const goalCigs = profile.objectiveType === 'complete' 
        ? 0 
        : getProgressiveGoal(profile, dayNumberFromStart - 1);
      
      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        entry,
        isToday: dateString === new Date().toISOString().split('T')[0],
        goalCigs,
        dayNumberFromStart,
      });
    }
    return days;
  };

  const progress = Math.min(elapsed / (7 * 24 * 60 * 60 * 1000), 1); // 7 jours max
  const ballColor = getBallColor(progress);
  const seedState = getSeedState(streak.currentStreak, 60);
  const seedProgress = getSeedProgress(streak.currentStreak, 60);
  
  // Calculer les statistiques
  const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries, elapsed);
  const moneySaved = calculateMoneySaved(cigarettesAvoided, settings.pricePerCig);
  
  // Debug pour vérifier les calculs (supprimé pour éviter les logs en boucle)

  const getDaysOfWeek = () => {
    const days = ['jeu.', 'ven.', 'sam.', 'dim.', 'lun.', 'mar.'];
    return days;
  };

  const formatTimeDisplay = (elapsed: number) => {
    const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
    const hours = Math.floor((elapsed % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((elapsed % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((elapsed % (60 * 1000)) / 1000);
    
    return {
      main: `${days}j ${hours}h ${minutes}min`,
      seconds: `${seconds}s`
    };
  };

  const timeDisplay = formatTimeDisplay(elapsed);

  return (
    <View style={styles.container}>
      {/* Fond étoilé */}
      <View style={styles.starryBackground}>
        {Array.from({ length: 150 }).map((_, i) => {
          const positions = [
            { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
            { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
            { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
            { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 },
            { left: 18, top: 85 }, { left: 38, top: 88 }, { left: 58, top: 82 }, { left: 78, top: 85 }, { left: 92, top: 90 },
            { left: 5, top: 25 }, { left: 95, top: 30 }, { left: 8, top: 45 }, { left: 92, top: 50 }, { left: 3, top: 65 },
            { left: 97, top: 70 }, { left: 6, top: 80 }, { left: 94, top: 85 }, { left: 22, top: 5 }, { left: 42, top: 3 },
            { left: 62, top: 7 }, { left: 82, top: 4 }, { left: 98, top: 8 }, { left: 2, top: 40 }, { left: 98, top: 45 },
            { left: 1, top: 60 }, { left: 99, top: 65 }, { left: 4, top: 80 }, { left: 96, top: 82 }, { left: 14, top: 95 },
            { left: 34, top: 92 }, { left: 54, top: 96 }, { left: 74, top: 93 }, { left: 86, top: 98 }
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
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Fond étoilé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 30 }).map((_, i) => {
            const positions = [
              { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
              { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
              { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
              { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 },
              { left: 18, top: 85 }, { left: 38, top: 88 }, { left: 58, top: 82 }, { left: 78, top: 85 }, { left: 92, top: 90 }
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
          <View style={styles.content}>
          
          {/* Frise des 7 jours */}
          <View style={styles.sevenDaysContainer}>
            <View style={styles.daysLabels}>
              {getSevenDaysData().map((day, index) => (
                <View key={index} style={styles.dayLabelContainer}>
                  <Text style={styles.dayLabel}>{day.dayName}</Text>
                  <Text style={styles.dayDate}>{day.dayNumber}/{new Date(day.date).getMonth() + 1}</Text>
                </View>
              ))}
            </View>
            <View style={styles.daysIndicators}>
              {getSevenDaysData().map((day, index) => {
                const hasEntry = day.entry !== undefined;
                const objectiveMet = day.entry?.objectiveMet || false;
                const realCigs = day.entry?.realCigs || 0;
                const goalCigs = day.goalCigs;
                const progress = goalCigs > 0 ? Math.min(realCigs / goalCigs, 1) : 0;
                const isOverGoal = realCigs > goalCigs;
                
                return (
                  <View key={index} style={styles.dayContainer}>
                    <TouchableOpacity
                      style={[
                        styles.dayIndicator,
                        hasEntry && {
                          backgroundColor: objectiveMet ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                          borderColor: objectiveMet ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)',
                        }
                      ]}
                      onPress={() => handleDailyEntry(index)}
                    >
                      {hasEntry ? (
                        <Text style={[
                          styles.dayIndicatorIcon,
                          { color: objectiveMet ? '#10B981' : '#EF4444' }
                        ]}>
                          {objectiveMet ? '✓' : '✗'}
                        </Text>
                      ) : (
                        <View style={styles.dayIndicatorInner} />
                      )}
                    </TouchableOpacity>
                    
                    {/* Barre de progression sous chaque jour */}
                    {hasEntry && (
                      <View style={styles.dayProgressContainer}>
                        <View style={styles.dayProgressBar}>
                          <View 
                            style={[
                              styles.dayProgressFill, 
                              { 
                                width: `${Math.min(progress * 100, 100)}%`,
                                backgroundColor: isOverGoal ? '#EF4444' : '#10B981'
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.dayProgressText}>
                          {realCigs}/{goalCigs}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Orb central */}
          <View style={styles.orbContainer}>
            <View style={styles.orb}>
              <View style={styles.orbGlow} />
            </View>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Vous avez arrêté de fumer depuis:</Text>
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{timeDisplay.main}</Text>
              <TouchableOpacity style={styles.secondsButton}>
                <Text style={styles.secondsText}>{timeDisplay.seconds}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.commitButton]}
              onPress={handleStart}
            >
              <Text style={styles.actionButtonIcon}>
                {session.startTimestamp ? '✓' : '🚀'}
              </Text>
              <Text style={styles.actionButtonText}>
                {session.startTimestamp ? 'Engagé' : 'Démarrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.meditateButton]}>
              <Text style={styles.actionButtonIcon}>🧘</Text>
              <Text style={styles.actionButtonText}>Méditer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.restartButton]}
              onPress={handleRestart}
            >
              <Text style={styles.actionButtonIcon}>↻</Text>
              <Text style={styles.actionButtonText}>Recommencer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.moreButton, { opacity: 0.5 }]}
              onPress={() => {
                console.log('🚫 Test de connexion DÉSACTIVÉ pour éviter le spam');
                Alert.alert('Désactivé', 'Test désactivé pour éviter le spam');
              }}
            >
              <Text style={styles.actionButtonIcon}>🚫</Text>
              <Text style={styles.actionButtonText}>Test OFF</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.moreButton, { backgroundColor: '#10B981', opacity: 0.5 }]}
              onPress={() => {
                console.log('🚫 Load DÉSACTIVÉ pour éviter le spam');
                Alert.alert('Désactivé', 'Load désactivé pour éviter le spam');
              }}
            >
              <Text style={styles.actionButtonIcon}>🚫</Text>
              <Text style={styles.actionButtonText}>Load OFF</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.moreButton, { backgroundColor: '#F59E0B', opacity: 0.5 }]}
              onPress={() => {
                console.log('🚫 Sync DÉSACTIVÉ pour éviter le spam');
                Alert.alert('Désactivé', 'Sync désactivé pour éviter le spam');
              }}
            >
              <Text style={styles.actionButtonIcon}>🚫</Text>
              <Text style={styles.actionButtonText}>Sync OFF</Text>
            </TouchableOpacity>
          </View>

          {/* Graine évolutive */}
          <View style={styles.seedContainer}>
            <Text style={styles.sectionTitle}>🌱 Ton arbre de progression</Text>
            <View style={styles.seedImage}>
              <Text style={styles.seedEmoji}>
                {seedState === 'tree' ? '🌳' : 
                 seedState === 'small_tree' ? '🌲' : 
                 seedState === 'sprout' ? '🌱' : '🌰'}
              </Text>
            </View>
            <Text style={styles.seedDescription}>
              Série de {streak.currentStreak} jour{streak.currentStreak > 1 ? 's' : ''}
            </Text>
            {/* Barre de progression de la graine */}
            <View style={styles.seedProgressContainer}>
              <View style={styles.seedProgressBar}>
                <View style={[styles.seedProgressFill, { width: `${seedProgress * 100}%` }]} />
              </View>
              <Text style={styles.seedProgressText}>
                {Math.round(seedProgress * 100)}% vers l'arbre complet
              </Text>
            </View>
          </View>

          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🚫</Text>
              <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
                {cigarettesAvoided}
              </Text>
              <Text style={styles.statLabel}>Cigarettes évitées</Text>
              <Text style={styles.statSubLabel}>
                Sur {Object.keys(dailyEntries).length} jour{Object.keys(dailyEntries).length > 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>{settings.currency}</Text>
              <Text style={[styles.statNumber, { color: '#51CF66' }]}>
                {moneySaved.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>€ économisés</Text>
              <Text style={styles.statSubLabel}>
                @ {settings.pricePerCig}€/cig
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={[styles.statNumber, { color: '#339AF0' }]}>
                {streak.currentStreak}
              </Text>
              <Text style={styles.statLabel}>Jours de croissance</Text>
              <Text style={styles.statSubLabel}>
                Série en cours
              </Text>
            </View>
          </View>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <Text style={styles.sectionTitle}>Objectif : Arrêt complet</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}% de votre objectif
            </Text>
          </View>

          {/* Dernier objectif santé accompli */}
          <View style={styles.healthGoalsContainer}>
            <Text style={styles.sectionTitle}>🏥 Dernier bénéfice santé</Text>
            
            {(() => {
              const currentBenefits = getCurrentHealthBenefits();
              
              // Trouver le dernier objectif accompli
              const accomplishedGoals = currentBenefits.filter(benefit => benefit.unlocked);
              
              if (accomplishedGoals.length === 0) {
                // Afficher le prochain objectif avec sa progression
                const nextGoal = currentBenefits.find(benefit => !benefit.unlocked);
                if (nextGoal) {
                  return (
                    <TouchableOpacity 
                      style={styles.healthGoalCard}
                      onPress={() => {
                        // Navigation vers l'onglet Analytics avec paramètre pour aller à Santé
                        console.log('MainTab - Navigating to Analytics with initialRoute: Santé');
                        navigation.navigate('Analytics', { initialRoute: 'Santé' });
                      }}
                    >
                      <Text style={styles.healthGoalText}>
                        🎯 Prochain objectif : {nextGoal.title}
                      </Text>
                      <Text style={styles.healthGoalSubtext}>
                        {nextGoal.description}
                      </Text>
                      <View style={styles.healthProgressBar}>
                        <View style={[styles.healthProgressFill, { width: `${nextGoal.progress}%` }]} />
                      </View>
                      <Text style={styles.healthGoalTimeRemaining}>
                        {Math.round(nextGoal.progress)}% accompli
                      </Text>
                    </TouchableOpacity>
                  );
                }
                
                return (
                  <TouchableOpacity 
                    style={styles.healthGoalCard}
                    onPress={() => {
                      // Navigation vers l'onglet Analytics avec paramètre pour aller à Santé
                      console.log('MainTab - Navigating to Analytics with initialRoute: Santé');
                      navigation.navigate('Analytics', { initialRoute: 'Santé' });
                    }}
                  >
                    <Text style={styles.healthGoalText}>
                      🚀 Commencez votre parcours santé !
                    </Text>
                    <Text style={styles.healthGoalSubtext}>
                      Cliquez pour voir tous les objectifs
                    </Text>
                  </TouchableOpacity>
                );
              }
              
              // Prendre le dernier objectif accompli (le plus récent)
              const lastAccomplished = accomplishedGoals[accomplishedGoals.length - 1];
              
              return (
                <TouchableOpacity 
                  style={[styles.healthGoalCard, styles.healthGoalCardAccomplished]}
                  onPress={() => {
                    // Navigation vers l'onglet Analytics avec paramètre pour aller à Santé
                    console.log('MainTab - Navigating to Analytics with initialRoute: Santé');
                    navigation.navigate('Analytics', { initialRoute: 'Santé' });
                  }}
                >
                  <View style={styles.healthGoalHeader}>
                    <Text style={styles.healthGoalTitleAccomplished}>{lastAccomplished.title}</Text>
                    <Text style={styles.healthGoalIcon}>✅</Text>
                  </View>
                  <Text style={styles.healthGoalDescriptionAccomplished}>
                    {lastAccomplished.description}
                  </Text>
                  <View style={styles.healthProgressBarAccomplished}>
                    <View style={styles.healthProgressFillAccomplished} />
                  </View>
                  <Text style={styles.healthGoalStatus}>
                    🎉 Objectif atteint ! Cliquez pour voir tous les bénéfices
                  </Text>
                </TouchableOpacity>
              );
            })()}
          </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Modal pour saisie quotidienne */}
      <DailyEntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEntry}
        date={selectedDate}
        goalCigs={profile.objectiveType === 'complete' ? 0 : getProgressiveGoal(profile, Object.keys(dailyEntries).length)}
        initialEntry={selectedDate ? dailyEntries[selectedDate] : undefined}
      />

      {/* Modal d'onboarding */}
      <OnboardingModal
        visible={onboardingVisible}
        onComplete={handleOnboardingComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071033',
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
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  sevenDaysContainer: {
    marginBottom: 40,
  },
  daysLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  dayLabelContainer: {
    alignItems: 'center',
  },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  dayDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
    marginTop: 2,
  },
  daysIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(139, 69, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayIndicatorInner: {
    width: 20,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  dayIndicatorIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayProgressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  dayProgressBar: {
    width: 30,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  dayProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dayProgressText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(139, 69, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orbContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  orb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#8B45FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#8B45FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 30,
  },
  orbGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    shadowColor: '#8B45FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 40,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.9,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginRight: 15,
  },
  secondsButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.5)',
  },
  secondsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  commitButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: 'rgba(76, 175, 80, 0.7)',
    shadowColor: '#4CAF50',
  },
  meditateButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderColor: 'rgba(139, 69, 255, 0.7)',
    shadowColor: '#8B45FF',
  },
  restartButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
    borderColor: 'rgba(255, 152, 0, 0.7)',
    shadowColor: '#FF9800',
  },
  moreButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderColor: 'rgba(139, 69, 255, 0.7)',
    shadowColor: '#8B45FF',
  },
  actionButtonIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 40,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 2,
  },
  statSubLabel: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#8B45FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B45FF',
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  healthGoalsContainer: {
    marginBottom: 30,
  },
  healthGoalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthGoalTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  healthGoalPercentage: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  healthGoalDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  healthProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  healthProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  healthGoalTimeRemaining: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  healthGoalText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  healthGoalSubtext: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  healthGoalCardAccomplished: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  healthGoalTitleAccomplished: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  healthGoalIcon: {
    fontSize: 18,
  },
  healthGoalDescriptionAccomplished: {
    color: '#E2E8F0',
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  healthProgressBarAccomplished: {
    height: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  healthProgressFillAccomplished: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
    width: '100%',
  },
  healthGoalStatus: {
    color: '#10B981',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '600',
  },
  seedContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  seedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  seedEmoji: {
    fontSize: 40,
  },
  seedDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  seedProgressContainer: {
    width: '100%',
    marginTop: 15,
  },
  seedProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  seedProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  seedProgressText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
});