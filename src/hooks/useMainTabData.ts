import { useState, useEffect, useCallback, useMemo } from 'react';
import { TimerSession, DailyEntry, StreakData, UserProfile, AppSettings } from '../types';
import { 
  calculateRealConnectionStreak,
  calculateCigarettesAvoided,
  calculateMoneySaved,
  getHealthBenefits
} from '../utils/calculations';
import { sessionStorage, dailyEntriesStorage, streakStorage, profileStorage, settingsStorage } from '../lib/storage';

export const useMainTabData = () => {
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
    onboardingCompleted: false,
  });
  const [settings, setSettings] = useState<AppSettings>({
    pricePerCig: 0.6,
    currency: '€',
    notificationsAllowed: true,
    language: 'fr',
    animationsEnabled: true,
    hapticsEnabled: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Charger les données au montage
  const loadData = useCallback(async () => {
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
      
      if (profileData) {
        if (profileData.smokingYears !== undefined && profileData.onboardingCompleted === undefined) {
          profileData.onboardingCompleted = true;
          await profileStorage.set(profileData);
        }
        setProfile(profileData);
      } else {
        setProfile(defaultProfile);
      }

      // Recalculer le streak basé sur les connexions réelles
      if (Object.keys(entriesData).length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const realConnectionStreak = calculateRealConnectionStreak(entriesData, today);
        
        const updatedStreak: StreakData = {
          lastDateConnected: today,
          currentStreak: realConnectionStreak,
        };
        setStreak(updatedStreak);
      } else {
        setStreak(streakData);
      }

      // Calculer le temps écoulé basé sur la session
      const now = Date.now();
      const elapsedTime = sessionData.isRunning && sessionData.startTimestamp
        ? now - sessionData.startTimestamp + sessionData.elapsedBeforePause
        : sessionData.elapsedBeforePause;

      setElapsed(elapsedTime);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  // Calculs optimisés avec useMemo
  const cigarettesAvoided = useMemo(() => 
    calculateCigarettesAvoided(profile, dailyEntries, elapsed), 
    [profile, dailyEntries, elapsed]
  );

  const moneySaved = useMemo(() => 
    calculateMoneySaved(cigarettesAvoided, settings.pricePerCig), 
    [cigarettesAvoided, settings.pricePerCig]
  );

  const healthBenefits = useMemo(() => {
    const defaultBenefits = getHealthBenefits();
    return defaultBenefits.map(benefit => ({
      ...benefit,
      unlocked: elapsed >= benefit.timeRequired * 60 * 1000,
      unlockedAt: elapsed >= benefit.timeRequired * 60 * 1000 ? new Date().toISOString() : undefined,
      progress: Math.min(100, (elapsed / (benefit.timeRequired * 60 * 1000)) * 100),
    }));
  }, [elapsed]);

  // Actions optimisées avec useCallback
  const handleStart = useCallback(async () => {
    const now = Date.now();
    const newSession: TimerSession = {
      isRunning: true,
      startTimestamp: now,
      elapsedBeforePause: session.elapsedBeforePause,
    };
    
    setSession(newSession);
    await sessionStorage.set(newSession);
  }, [session.elapsedBeforePause]);

  const handleStop = useCallback(async () => {
    const now = Date.now();
    const elapsedTime = session.startTimestamp ? now - session.startTimestamp + session.elapsedBeforePause : session.elapsedBeforePause;
    
    const newSession: TimerSession = {
      isRunning: false,
      startTimestamp: null,
      elapsedBeforePause: elapsedTime,
    };
    
    setSession(newSession);
    await sessionStorage.set(newSession);
  }, [session]);

  const handleSaveEntry = useCallback(async (entry: DailyEntry) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const entryWithConnectionDate: DailyEntry = {
        ...entry,
        connectedOnDate: today
      };
      
      const newEntries = { ...dailyEntries, [entry.date]: entryWithConnectionDate };
      setDailyEntries(newEntries);
      
      setIsSyncing(true);
      await dailyEntriesStorage.addEntry(entry.date, entryWithConnectionDate);
      setIsSyncing(false);
      
      const realConnectionStreak = calculateRealConnectionStreak(newEntries, today);
      const newStreakData: StreakData = {
        lastDateConnected: today,
        currentStreak: realConnectionStreak,
      };
      
      setStreak(newStreakData);
      await streakStorage.set(newStreakData);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setIsSyncing(false);
      return false;
    }
  }, [dailyEntries]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer effect
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

  return {
    // État
    session,
    elapsed,
    dailyEntries,
    streak,
    profile,
    settings,
    isSyncing,
    
    // Calculs optimisés
    cigarettesAvoided,
    moneySaved,
    healthBenefits,
    
    // Actions
    handleStart,
    handleStop,
    handleSaveEntry,
    loadData,
    
    // Setters
    setProfile,
    setSettings,
  };
};
