import { UserProfile, DailyEntry, Statistics, HealthBenefit } from '../types';

// Calcul des cigarettes évitées
export const calculateCigarettesAvoided = (
  profile: UserProfile,
  dailyEntries: Record<string, DailyEntry>,
  sessionElapsed: number
): number => {
  let totalAvoided = 0;
  
  // Parcourir chaque entrée quotidienne
  Object.values(dailyEntries).forEach(entry => {
    // Cigarettes qui auraient été fumées ce jour selon le profil initial
    const dailyGoal = profile.cigsPerDay;
    
    // Cigarettes réellement fumées ce jour
    const realCigs = entry.realCigs;
    
    // Cigarettes évitées ce jour = différence
    const dailyAvoided = Math.max(0, dailyGoal - realCigs);
    
    totalAvoided += dailyAvoided;
  });
  
  return totalAvoided;
};

// Calcul des économies
export const calculateMoneySaved = (
  cigarettesAvoided: number,
  pricePerCig: number
): number => {
  return cigarettesAvoided * pricePerCig;
};

// Calcul de la série (streak)
export const calculateStreak = (
  dailyEntries: Record<string, DailyEntry>,
  lastDateConnected: string
): number => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Si on a une entrée aujourd'hui ou hier, on continue la série
  if (dailyEntries[today] || dailyEntries[yesterday]) {
    return Object.keys(dailyEntries).length;
  }
  
  return 0;
};

// Calcul du plan théorique pour arrêt progressif
export const calculateTheoreticalPlan = (
  profile: UserProfile,
  days: number
): number[] => {
  if (profile.objectiveType === 'complete') {
    return new Array(days).fill(0);
  }
  
  const plan: number[] = [];
  const reductionFrequency = profile.reductionFrequency || 1;
  let currentCigs = profile.cigsPerDay;
  
  for (let day = 0; day < days; day++) {
    if (day > 0 && day % reductionFrequency === 0) {
      currentCigs = Math.max(0, currentCigs - 1);
    }
    plan.push(currentCigs);
  }
  
  return plan;
};

// Calcul des statistiques globales
export const calculateStatistics = (
  profile: UserProfile,
  dailyEntries: Record<string, DailyEntry>,
  sessionElapsed: number,
  pricePerCig: number,
  currentStreak: number
): Statistics => {
  const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries, sessionElapsed);
  const moneySaved = calculateMoneySaved(cigarettesAvoided, pricePerCig);
  const daysOfGrowth = currentStreak;
  
  return {
    cigarettesAvoided,
    moneySaved,
    daysOfGrowth,
    currentStreak,
    longestStreak: currentStreak, // TODO: implémenter le calcul du plus long streak
  };
};

// Bénéfices santé selon l'OMS
export const getHealthBenefits = (): HealthBenefit[] => [
  {
    id: '20min',
    title: '20 minutes',
    description: 'Pression sanguine et rythme cardiaque normalisés',
    timeRequired: 20,
    unlocked: false,
  },
  {
    id: '12h',
    title: '12 heures',
    description: 'Monoxyde de carbone normalisé',
    timeRequired: 12 * 60,
    unlocked: false,
  },
  {
    id: '24h',
    title: '24 heures',
    description: 'Circulation améliorée',
    timeRequired: 24 * 60,
    unlocked: false,
  },
  {
    id: '48h',
    title: '48 heures',
    description: 'Saveur et odorat améliorés',
    timeRequired: 48 * 60,
    unlocked: false,
  },
  {
    id: '72h',
    title: '72 heures',
    description: 'Respiration facilitée',
    timeRequired: 72 * 60,
    unlocked: false,
  },
  {
    id: '14days',
    title: '14 jours',
    description: 'Risque d\'infection réduit',
    timeRequired: 14 * 24 * 60,
    unlocked: false,
  },
  {
    id: '30days',
    title: '30 jours',
    description: 'Risque de crise cardiaque réduit',
    timeRequired: 30 * 24 * 60,
    unlocked: false,
  },
  {
    id: '1year',
    title: '1 an',
    description: 'Risque de cancer du poumon réduit',
    timeRequired: 365 * 24 * 60,
    unlocked: false,
  },
];

// Mise à jour des bénéfices santé débloqués
export const updateUnlockedHealthBenefits = (
  benefits: HealthBenefit[],
  sessionElapsed: number
): HealthBenefit[] => {
  return benefits.map(benefit => ({
    ...benefit,
    unlocked: sessionElapsed >= benefit.timeRequired * 60 * 1000,
    unlockedAt: sessionElapsed >= benefit.timeRequired * 60 * 1000 
      ? new Date().toISOString() 
      : undefined,
  }));
};

// Formatage du temps
export const formatTime = (milliseconds: number): string => {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  
  if (days > 0) {
    return `${days}j ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Calcul de l'état de la graine basé sur la série avec phases progressives
export const getSeedState = (streak: number, totalDays: number = 60): 'seed' | 'sprout' | 'small_tree' | 'tree' => {
  const phases = Math.ceil(totalDays / 6); // 6 phases d'évolution
  const phaseSize = totalDays / phases;
  
  if (streak >= phaseSize * 5) return 'tree';
  if (streak >= phaseSize * 3) return 'small_tree';
  if (streak >= phaseSize * 1) return 'sprout';
  return 'seed';
};

// Calcul de l'objectif progressif pour un jour donné
export const getProgressiveGoal = (
  profile: UserProfile,
  dayIndex: number,
  totalDays: number = 60
): number => {
  if (profile.objectiveType === 'complete') {
    return 0;
  }
  
  const startCigs = profile.cigsPerDay;
  const endCigs = 0;
  const reductionPerPhase = startCigs / (totalDays / (profile.reductionFrequency || 1));
  
  return Math.max(endCigs, Math.floor(startCigs - (dayIndex * reductionPerPhase)));
};

// Calcul du pourcentage de progression de la graine
export const getSeedProgress = (streak: number, totalDays: number = 60): number => {
  const phases = Math.ceil(totalDays / 6);
  const phaseSize = totalDays / phases;
  
  if (streak >= totalDays) return 1;
  
  return Math.min(streak / totalDays, 1);
};

// Vérification si un jour est manqué (pas d'entrée)
export const isDayMissed = (
  date: string,
  dailyEntries: Record<string, DailyEntry>
): boolean => {
  return !dailyEntries[date];
};

// Calcul des jours consécutifs réussis (streak valide)
export const calculateValidStreak = (
  dailyEntries: Record<string, DailyEntry>,
  currentDate: string
): number => {
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) return 0;
  
  let streak = 0;
  let checkDate = new Date(currentDate);
  
  // Vérifier les jours en arrière
  for (let i = 0; i < 365; i++) { // Max 1 an
    const dateStr = checkDate.toISOString().split('T')[0];
    const entry = dailyEntries[dateStr];
    
    if (entry && entry.objectiveMet) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Vérification si des jours ont été manqués et reset du streak si nécessaire
export const checkAndResetStreak = (
  dailyEntries: Record<string, DailyEntry>,
  currentDate: string
): { shouldReset: boolean; daysMissed: number } => {
  const today = new Date(currentDate);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Si on a une entrée aujourd'hui, pas de reset
  if (dailyEntries[todayStr]) {
    return { shouldReset: false, daysMissed: 0 };
  }
  
  // Compter les jours manqués depuis la dernière entrée
  let daysMissed = 0;
  let checkDate = new Date(yesterday);
  
  // Trouver la dernière entrée
  const sortedDates = Object.keys(dailyEntries).sort().reverse();
  if (sortedDates.length === 0) {
    return { shouldReset: true, daysMissed: 1 };
  }
  
  const lastEntryDate = new Date(sortedDates[0]);
  
  // Compter les jours manqués depuis la dernière entrée
  while (checkDate >= lastEntryDate) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (!dailyEntries[dateStr]) {
      daysMissed++;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Reset si plus d'un jour manqué
  return { shouldReset: daysMissed > 1, daysMissed };
};

// Calcul de la couleur de la boule basée sur le progrès
export const getBallColor = (progress: number): string => {
  if (progress >= 0.8) return '#10B981'; // Vert
  if (progress >= 0.5) return '#F59E0B'; // Orange
  return '#EF4444'; // Rouge
};

// Génération des données pour le graphique des cigarettes
export const generateCigarettesChartData = (
  profile: UserProfile,
  dailyEntries: Record<string, DailyEntry>,
  daysToShow: number = 30
) => {
  const theoreticalData: number[] = [];
  const realData: number[] = [];
  const labels: string[] = [];
  
  // Trouver la première entrée pour commencer le graphique
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) {
    // Pas de données, retourner des données vides
    return {
      labels: ['Jour 1'],
      datasets: [
        {
          data: [profile.cigsPerDay],
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
          strokeDashArray: [5, 5],
        },
        {
          data: [0],
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }
  
  const startDate = new Date(sortedDates[0]);
  
  // Générer exactement 30 jours depuis le premier jour d'entrée
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Calcul théorique (projection de réduction)
    const theoreticalCigs = getProgressiveGoal(profile, i, daysToShow);
    theoreticalData.push(theoreticalCigs);
    
    // Données réelles
    const entry = dailyEntries[dateString];
    realData.push(entry ? entry.realCigs : 0);
    
    // Labels au format DD/MM (afficher seulement tous les 5 jours pour éviter la surcharge)
    if (i % 5 === 0 || i === daysToShow - 1) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);
    } else {
      labels.push('');
    }
  }
  
  return {
    labels,
    datasets: [
      {
        data: theoreticalData,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Bleu pour théorique
        strokeWidth: 2,
        strokeDashArray: [5, 5], // Ligne pointillée
      },
      {
        data: realData,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Vert pour réel
        strokeWidth: 3,
      },
    ],
  };
};

// Génération des données pour le graphique des économies cumulatives
export const generateSavingsChartData = (
  profile: UserProfile,
  dailyEntries: Record<string, DailyEntry>,
  pricePerCig: number,
  daysToShow: number = 30
) => {
  const theoreticalData: number[] = [];
  const realData: number[] = [];
  const labels: string[] = [];
  
  // Trouver la première entrée pour commencer le graphique
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) {
    // Pas de données, retourner des données vides
    return {
      labels: ['Jour 1'],
      datasets: [
        {
          data: [0],
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
          strokeDashArray: [5, 5],
        },
        {
          data: [0],
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }
  
  const startDate = new Date(sortedDates[0]);
  
  let theoreticalCumulative = 0;
  let realCumulative = 0;
  
  // Générer exactement 30 jours depuis le premier jour d'entrée
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Calcul théorique cumulatif
    const theoreticalCigs = getProgressiveGoal(profile, i, daysToShow);
    const dailyTheoreticalSavings = Math.max(0, profile.cigsPerDay - theoreticalCigs) * pricePerCig;
    theoreticalCumulative += dailyTheoreticalSavings;
    theoreticalData.push(theoreticalCumulative);
    
    // Données réelles cumulatives
    const entry = dailyEntries[dateString];
    if (entry) {
      const dailyRealSavings = Math.max(0, profile.cigsPerDay - entry.realCigs) * pricePerCig;
      realCumulative += dailyRealSavings;
    }
    realData.push(realCumulative);
    
    // Labels au format DD/MM (afficher seulement tous les 5 jours pour éviter la surcharge)
    if (i % 5 === 0 || i === daysToShow - 1) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);
    } else {
      labels.push('');
    }
  }
  
  return {
    labels,
    datasets: [
      {
        data: theoreticalData,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Bleu pour théorique
        strokeWidth: 2,
        strokeDashArray: [5, 5], // Ligne pointillée
      },
      {
        data: realData,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Vert pour réel
        strokeWidth: 3,
      },
    ],
  };
};
