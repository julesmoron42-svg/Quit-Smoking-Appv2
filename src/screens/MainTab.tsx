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
import { LinearGradient } from 'expo-linear-gradient';
import { sessionStorage, dailyEntriesStorage, streakStorage, profileStorage, settingsStorage } from '../lib/storage';
import { 
  formatTime, 
  getBallColor, 
  getSeedState, 
  getProgressiveGoal,
  calculateValidStreak,
  calculateCigarettesAvoided,
  calculateMoneySaved,
  getSeedProgress,
  checkAndResetStreak
} from '../utils/calculations';
import { TimerSession, DailyEntry, StreakData, UserProfile, AppSettings } from '../types';
import DailyEntryModal from '../components/DailyEntryModal';

const { width } = Dimensions.get('window');

export default function MainTab() {
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


  useEffect(() => {
    loadData();
  }, []);

  // Vérifier le reset du streak au chargement
  useEffect(() => {
    const checkStreakReset = () => {
      const today = new Date().toISOString().split('T')[0];
      const { shouldReset, daysMissed } = checkAndResetStreak(dailyEntries, today);
      
      if (shouldReset && daysMissed > 1) {
        // Reset du streak si plus d'un jour manqué
        const newStreak: StreakData = {
          lastDateConnected: today,
          currentStreak: 0,
        };
        setStreak(newStreak);
        streakStorage.set(newStreak);
        
        Alert.alert(
          'Série interrompue',
          `Vous avez manqué ${daysMissed} jour(s). Votre série recommence à 0. 🌱`,
          [{ text: 'OK' }]
        );
      }
    };

    if (Object.keys(dailyEntries).length > 0) {
      checkStreakReset();
    }
  }, [dailyEntries]);

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
      setStreak(streakData);
      setProfile(profileData);
      setSettings(settingsData);
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
      'Êtes-vous sûr de vouloir redémarrer le chronomètre ?',
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
          },
        },
      ]
    );
  };

  const handleDailyEntry = (day: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - day));
    const dateString = date.toISOString().split('T')[0];
    
    setSelectedDate(dateString);
    setModalVisible(true);
  };

  const handleSaveEntry = async (entry: DailyEntry) => {
    try {
      const newEntries = { ...dailyEntries, [entry.date]: entry };
      setDailyEntries(newEntries);
      await dailyEntriesStorage.set(newEntries);
      
      // Recalculer le streak valide
      const validStreak = calculateValidStreak(newEntries, entry.date);
      const newStreak: StreakData = {
        lastDateConnected: entry.date,
        currentStreak: validStreak,
      };
      setStreak(newStreak);
      await streakStorage.set(newStreak);
      
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
        streak: validStreak
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

  const getSevenDaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = dailyEntries[dateString];
      
      // Calculer l'objectif pour ce jour
      const dayIndex = Object.keys(dailyEntries).length + i;
      const goalCigs = profile.objectiveType === 'complete' 
        ? 0 
        : getProgressiveGoal(profile, dayIndex);
      
      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        entry,
        isToday: i === 0,
        goalCigs,
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
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.gradientContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
          {/* Frise des 7 jours */}
          <View style={styles.sevenDaysContainer}>
            <View style={styles.daysLabels}>
              {getSevenDaysData().map((day, index) => (
                <Text key={index} style={styles.dayLabel}>{day.dayName}</Text>
              ))}
            </View>
            <View style={styles.daysIndicators}>
              {getSevenDaysData().map((day, index) => {
                const hasEntry = day.entry !== undefined;
                const objectiveMet = day.entry?.objectiveMet || false;
                
                return (
                  <TouchableOpacity
                    key={index}
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
              <Text style={styles.actionButtonIcon}>✓</Text>
              <Text style={styles.actionButtonText}>Engagé</Text>
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

            <TouchableOpacity style={[styles.actionButton, styles.moreButton]}>
              <Text style={styles.actionButtonIcon}>⋯</Text>
              <Text style={styles.actionButtonText}>Plus</Text>
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

          {/* Achievement santé */}
          <View style={styles.achievementContainer}>
            <Text style={styles.sectionTitle}>🏆 Dernier bénéfice santé</Text>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementText}>
                +24h : Respiration améliorée
              </Text>
            </View>
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
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  daysIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
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
  achievementContainer: {
    marginBottom: 30,
  },
  achievementCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  achievementText: {
    color: '#F8FAFC',
    fontSize: 16,
    textAlign: 'center',
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