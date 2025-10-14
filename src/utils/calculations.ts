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

// Bénéfices santé selon l'OMS - Source officielle
export const getHealthBenefits = (): HealthBenefit[] => [
  {
    id: '20min',
    title: '20 minutes',
    description: 'Votre rythme cardiaque et votre pression sanguine diminuent',
    timeRequired: 20,
    unlocked: false,
  },
  {
    id: '12h',
    title: '12 heures',
    description: 'Votre taux sanguin de monoxyde de carbone redevient normal',
    timeRequired: 12 * 60,
    unlocked: false,
  },
  {
    id: '2-12weeks',
    title: '2 à 12 semaines',
    description: 'Votre circulation s\'améliore et votre fonction pulmonaire augmente',
    timeRequired: 2 * 7 * 24 * 60, // 2 semaines en minutes
    unlocked: false,
  },
  {
    id: '1-9months',
    title: '1 à 9 mois',
    description: 'La toux et l\'essoufflement diminuent',
    timeRequired: 30 * 24 * 60, // 1 mois en minutes
    unlocked: false,
  },
  {
    id: '1year',
    title: '1 an',
    description: 'Votre risque de cardiopathie coronarienne diminue de près de moitié',
    timeRequired: 365 * 24 * 60,
    unlocked: false,
  },
  {
    id: '5years',
    title: '5 ans',
    description: 'Votre risque d\'accident vasculaire cérébral redevient le même que pour un non-fumeur',
    timeRequired: 5 * 365 * 24 * 60,
    unlocked: false,
  },
  {
    id: '10years',
    title: '10 ans',
    description: 'Votre risque de cancer du poumon tombe à près de la moitié et votre risque de cancer de la bouche, de la gorge, de l\'œsophage, de la vessie, du col de l\'utérus et du pancréas diminue',
    timeRequired: 10 * 365 * 24 * 60,
    unlocked: false,
  },
  {
    id: '15years',
    title: '15 ans',
    description: 'Le risque de cardiopathie coronarienne redevient le même que pour un non-fumeur',
    timeRequired: 15 * 365 * 24 * 60,
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
  totalDays: number = 60,
  startDate?: Date
): number => {
  const startCigs = profile.cigsPerDay;
  
  // Si arrêt immédiat (complete) et date d'arrêt définie
  if (profile.objectiveType === 'complete' && profile.targetDate) {
    const targetDate = new Date(profile.targetDate);
    const currentDate = startDate ? new Date(startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000) : new Date();
    
    // Si on est après la date d'arrêt, consommation = 0
    if (currentDate >= targetDate) {
      return 0;
    }
    
    // Avant la date d'arrêt, consommation normale
    return startCigs;
  }
  
  // Si arrêt immédiat sans date spécifique, retourner 0
  if (profile.objectiveType === 'complete') {
    return 0;
  }
  
  // Si réduction progressive
  const reductionPerWeek = profile.reductionFrequency || 1; // cigarettes à réduire par semaine
  
  // Calculer le nombre de semaines écoulées
  const weeksElapsed = Math.floor(dayIndex / 7);
  
  // Calculer la consommation théorique : diminuer de reductionPerWeek cigarettes par semaine
  const theoreticalCigs = Math.max(0, startCigs - (weeksElapsed * reductionPerWeek));
  
  return Math.floor(theoreticalCigs);
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
  
  // Vérifier les jours en arrière, en commençant par aujourd'hui
  for (let i = 0; i < 365; i++) { // Max 1 an
    const dateStr = checkDate.toISOString().split('T')[0];
    const entry = dailyEntries[dateStr];
    
    if (entry && entry.objectiveMet) {
      streak++;
      // Passer au jour précédent
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Arrêter dès qu'on trouve un jour sans entrée ou sans objectif atteint
      break;
    }
  }
  
  return streak;
};

// Calcul du streak basé sur les jours de connexion (entrées quotidiennes)
export const calculateConnectionStreak = (
  dailyEntries: Record<string, DailyEntry>,
  currentDate: string
): number => {
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) return 0;
  
  let streak = 0;
  let checkDate = new Date(currentDate);
  
  // Vérifier les jours en arrière, en commençant par aujourd'hui
  for (let i = 0; i < 365; i++) { // Max 1 an
    const dateStr = checkDate.toISOString().split('T')[0];
    const entry = dailyEntries[dateStr];
    
    if (entry) {
      // Si on a une entrée (même si l'objectif n'est pas atteint), on compte le jour
      streak++;
      // Passer au jour précédent
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Arrêter dès qu'on trouve un jour sans entrée
      break;
    }
  }
  
  return streak;
};

// Calcul du streak basé sur la session du chrono (pour les utilisateurs qui se connectent quotidiennement)
export const calculateSessionStreak = (
  sessionElapsed: number,
  currentDate: string
): number => {
  console.log('🔍 calculateSessionStreak - Temps écoulé:', sessionElapsed);
  console.log('🔍 calculateSessionStreak - Date actuelle:', currentDate);
  
  // Calculer le nombre de jours depuis le début de la session
  const daysElapsed = Math.floor(sessionElapsed / (24 * 60 * 60 * 1000));
  
  // Si on a moins de 24h, on considère qu'on est au jour 1
  const streak = Math.max(1, daysElapsed + 1);
  
  console.log('🔍 calculateSessionStreak - Jours écoulés:', daysElapsed);
  console.log('🔍 calculateSessionStreak - Streak calculé:', streak);
  
  return streak;
};

// Vérification si des jours ont été manqués et reset du streak si nécessaire
export const checkAndResetStreak = (
  dailyEntries: Record<string, DailyEntry>,
  currentDate: string
): { shouldReset: boolean; daysMissed: number } => {
  const today = new Date(currentDate);
  const todayStr = today.toISOString().split('T')[0];
  
  // Si on a une entrée aujourd'hui, pas de reset
  if (dailyEntries[todayStr]) {
    return { shouldReset: false, daysMissed: 0 };
  }
  
  // Trouver la dernière entrée
  const sortedDates = Object.keys(dailyEntries).sort().reverse();
  if (sortedDates.length === 0) {
    // Pas d'entrées du tout, pas de reset automatique
    return { shouldReset: false, daysMissed: 0 };
  }
  
  const lastEntryDate = new Date(sortedDates[0]);
  const daysSinceLastEntry = Math.floor((today.getTime() - lastEntryDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // Reset seulement si plus de 2 jours se sont écoulés depuis la dernière entrée
  // Cela laisse du temps jusqu'à 23h59 pour saisir l'entrée du jour
  return { 
    shouldReset: daysSinceLastEntry > 2, 
    daysMissed: daysSinceLastEntry 
  };
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
  
  
  // Trouver les dates disponibles
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) {
    // Pas de données, retourner des données vides
    return {
      labels: ['Jour 1'],
      datasets: [
        {
          data: [profile.cigsPerDay],
          color: (opacity = 1) => `rgba(139, 69, 255, ${opacity})`,
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
  
  // Déterminer la période à afficher
  let startDate: Date;
  let actualDaysToShow: number;
  
  if (daysToShow <= 30) {
    // Pour 1M : utiliser les 30 derniers jours
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() - (daysToShow - 1));
    actualDaysToShow = daysToShow;
  } else {
    // Pour 6M, 1Y, 10Y : commencer au premier jour d'entrée et afficher la période demandée
    startDate = new Date(sortedDates[0]);
    actualDaysToShow = daysToShow;
  }
  
  // Générer les données pour la période déterminée
  for (let i = 0; i < actualDaysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Récupérer l'entrée pour ce jour
    const entry = dailyEntries[dateString];
    
    // Utiliser l'objectif réel de l'entrée si elle existe, sinon calculer théoriquement
    let theoreticalCigs;
    if (entry && entry.goalCigs !== undefined) {
      // Utiliser l'objectif réel stocké dans la base de données
      theoreticalCigs = entry.goalCigs;
    } else {
      // Calculer l'objectif théorique basé sur le nombre d'entrées jusqu'à ce jour
      const entriesUpToThisDay = Object.keys(dailyEntries).filter(entryDate => entryDate <= dateString).length;
      theoreticalCigs = getProgressiveGoal(profile, entriesUpToThisDay);
    }
    theoreticalData.push(theoreticalCigs);
    
    // Données réelles
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
        color: (opacity = 1) => `rgba(139, 69, 255, ${opacity})`, // Bleu pour théorique
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
  
  // Trouver les dates disponibles
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) {
    // Pas de données, retourner des données vides
    return {
      labels: ['Jour 1'],
      datasets: [
        {
          data: [0],
          color: (opacity = 1) => `rgba(139, 69, 255, ${opacity})`,
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
  
  // Déterminer la période à afficher
  let startDate: Date;
  let actualDaysToShow: number;
  
  if (daysToShow <= 30) {
    // Pour 1M : utiliser les 30 derniers jours
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() - (daysToShow - 1));
    actualDaysToShow = daysToShow;
  } else {
    // Pour 6M, 1Y, 10Y : commencer au premier jour d'entrée et afficher la période demandée
    startDate = new Date(sortedDates[0]);
    actualDaysToShow = daysToShow;
  }
  
  let theoreticalCumulative = 0;
  let realCumulative = 0;
  
  // Générer les données pour la période déterminée
  for (let i = 0; i < actualDaysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Récupérer l'entrée pour ce jour
    const entry = dailyEntries[dateString];
    
    // Utiliser l'objectif réel de l'entrée si elle existe, sinon calculer théoriquement
    let theoreticalCigs;
    if (entry && entry.goalCigs !== undefined) {
      // Utiliser l'objectif réel stocké dans la base de données
      theoreticalCigs = entry.goalCigs;
    } else {
      // Calculer l'objectif théorique basé sur le nombre d'entrées jusqu'à ce jour
      const entriesUpToThisDay = Object.keys(dailyEntries).filter(entryDate => entryDate <= dateString).length;
      theoreticalCigs = getProgressiveGoal(profile, entriesUpToThisDay);
    }
    const dailyTheoreticalSavings = Math.max(0, profile.cigsPerDay - theoreticalCigs) * pricePerCig;
    theoreticalCumulative += dailyTheoreticalSavings;
    theoreticalData.push(theoreticalCumulative);
    
    // Données réelles cumulatives
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
        color: (opacity = 1) => `rgba(139, 69, 255, ${opacity})`, // Bleu pour théorique
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
