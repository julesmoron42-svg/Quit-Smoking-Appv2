// Script pour calculer les valeurs attendues avec les données corrigées
// Ce script simule exactement les calculs de l'application

// Simulation des données de profil
const profile = {
  cigsPerDay: 20, // IMPORTANT: c'est la référence pour calculer les cigarettes évitées
  objectiveType: 'progressive',
  reductionFrequency: 1
};

// Simulation des paramètres
const settings = {
  pricePerCig: 0.65
};

// Données d'entrées quotidiennes (40 jours) - dans l'ordre chronologique
const dailyEntries = {
  // Semaine 1 (jours 1-7): objectif 20
  'week1_day1': { realCigs: 22, goalCigs: 20, objectiveMet: false },
  'week1_day2': { realCigs: 20, goalCigs: 20, objectiveMet: true },
  'week1_day3': { realCigs: 23, goalCigs: 20, objectiveMet: false },
  'week1_day4': { realCigs: 19, goalCigs: 20, objectiveMet: true },
  'week1_day5': { realCigs: 21, goalCigs: 20, objectiveMet: false },
  'week1_day6': { realCigs: 20, goalCigs: 20, objectiveMet: true },
  'week1_day7': { realCigs: 18, goalCigs: 20, objectiveMet: true },
  
  // Semaine 2 (jours 8-14): objectif 19
  'week2_day1': { realCigs: 18, goalCigs: 19, objectiveMet: true },
  'week2_day2': { realCigs: 19, goalCigs: 19, objectiveMet: true },
  'week2_day3': { realCigs: 17, goalCigs: 19, objectiveMet: true },
  'week2_day4': { realCigs: 18, goalCigs: 19, objectiveMet: true },
  'week2_day5': { realCigs: 19, goalCigs: 19, objectiveMet: true },
  'week2_day6': { realCigs: 17, goalCigs: 19, objectiveMet: true },
  'week2_day7': { realCigs: 18, goalCigs: 19, objectiveMet: true },
  
  // Semaine 3 (jours 15-21): objectif 18
  'week3_day1': { realCigs: 19, goalCigs: 18, objectiveMet: false },
  'week3_day2': { realCigs: 17, goalCigs: 18, objectiveMet: true },
  'week3_day3': { realCigs: 18, goalCigs: 18, objectiveMet: true },
  'week3_day4': { realCigs: 19, goalCigs: 18, objectiveMet: false },
  'week3_day5': { realCigs: 17, goalCigs: 18, objectiveMet: true },
  'week3_day6': { realCigs: 18, goalCigs: 18, objectiveMet: true },
  'week3_day7': { realCigs: 16, goalCigs: 18, objectiveMet: true },
  
  // Semaine 4 (jours 22-28): objectif 17
  'week4_day1': { realCigs: 16, goalCigs: 17, objectiveMet: true },
  'week4_day2': { realCigs: 17, goalCigs: 17, objectiveMet: true },
  'week4_day3': { realCigs: 15, goalCigs: 17, objectiveMet: true },
  'week4_day4': { realCigs: 16, goalCigs: 17, objectiveMet: true },
  'week4_day5': { realCigs: 17, goalCigs: 17, objectiveMet: true },
  'week4_day6': { realCigs: 15, goalCigs: 17, objectiveMet: true },
  'week4_day7': { realCigs: 16, goalCigs: 17, objectiveMet: true },
  
  // Semaine 5 (jours 29-35): objectif 16
  'week5_day1': { realCigs: 15, goalCigs: 16, objectiveMet: true },
  'week5_day2': { realCigs: 16, goalCigs: 16, objectiveMet: true },
  'week5_day3': { realCigs: 14, goalCigs: 16, objectiveMet: true },
  'week5_day4': { realCigs: 15, goalCigs: 16, objectiveMet: true },
  'week5_day5': { realCigs: 16, goalCigs: 16, objectiveMet: true },
  'week5_day6': { realCigs: 14, goalCigs: 16, objectiveMet: true },
  'week5_day7': { realCigs: 15, goalCigs: 16, objectiveMet: true },
  
  // Semaine 6 (jours 36-40): objectif 15
  'week6_day1': { realCigs: 14, goalCigs: 15, objectiveMet: true },
  'week6_day2': { realCigs: 15, goalCigs: 15, objectiveMet: true },
  'week6_day3': { realCigs: 13, goalCigs: 15, objectiveMet: true },
  'week6_day4': { realCigs: 14, goalCigs: 15, objectiveMet: true },
  'week6_day5': { realCigs: 15, goalCigs: 15, objectiveMet: true }
};

// Fonction de calcul des cigarettes évitées (copiée de l'application)
function calculateCigarettesAvoided(profile, dailyEntries, sessionElapsed) {
  let totalAvoided = 0;
  
  Object.values(dailyEntries).forEach(entry => {
    // Cigarettes qui auraient été fumées ce jour selon le profil initial
    const dailyGoal = profile.cigsPerDay; // 20 cigarettes par jour
    
    // Cigarettes réellement fumées ce jour
    const realCigs = entry.realCigs;
    
    // Cigarettes évitées ce jour = différence
    const dailyAvoided = Math.max(0, dailyGoal - realCigs);
    
    totalAvoided += dailyAvoided;
  });
  
  return totalAvoided;
}

// Fonction de calcul des économies
function calculateMoneySaved(cigarettesAvoided, pricePerCig) {
  return cigarettesAvoided * pricePerCig;
}

// Fonction de calcul du streak basé sur les connexions
function calculateConnectionStreak(dailyEntries, currentDate) {
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) return 0;
  
  let streak = 0;
  let checkDate = new Date(currentDate);
  
  // Vérifier les jours en arrière, en commençant par aujourd'hui
  for (let i = 0; i < 365; i++) {
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
}

// Fonction d'évolution de la graine
function getSeedState(streak, totalDays = 60) {
  const phases = Math.ceil(totalDays / 6); // 6 phases d'évolution
  const phaseSize = totalDays / phases;
  
  if (streak >= phaseSize * 5) return 'tree';
  if (streak >= phaseSize * 3) return 'small_tree';
  if (streak >= phaseSize * 1) return 'sprout';
  return 'seed';
}

// Fonction de progression de la graine
function getSeedProgress(streak, totalDays = 60) {
  return Math.min(streak / totalDays, 1);
}

// Calculs
console.log('🧮 CALCULS ATTENDUS AVEC LES DONNÉES CORRIGÉES');
console.log('=' .repeat(60));

// Calcul des cigarettes évitées
const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries, 0);
console.log(`\n📊 CIGARETTES ÉVITÉES:`);
console.log(`   Total: ${cigarettesAvoided} cigarettes`);

// Détail par jour
let totalDetail = 0;
Object.entries(dailyEntries).forEach(([day, entry]) => {
  const dailyAvoided = Math.max(0, profile.cigsPerDay - entry.realCigs);
  totalDetail += dailyAvoided;
  if (dailyAvoided > 0) {
    console.log(`   ${day}: ${profile.cigsPerDay} - ${entry.realCigs} = ${dailyAvoided} évitées`);
  }
});

console.log(`   Vérification: ${totalDetail} cigarettes évitées`);

// Calcul des économies
const moneySaved = calculateMoneySaved(cigarettesAvoided, settings.pricePerCig);
console.log(`\n💰 ÉCONOMIES:`);
console.log(`   Total: ${moneySaved.toFixed(2)}€`);

// Calcul du streak (simulation avec 40 jours consécutifs)
const streak = 40; // Avec des données consécutives, le streak devrait être de 40
console.log(`\n📅 STREAK:`);
console.log(`   Jours consécutifs: ${streak}`);

// Évolution de la graine
const seedState = getSeedState(streak, 60);
const seedProgress = getSeedProgress(streak, 60);
console.log(`\n🌱 ÉVOLUTION DE LA GRAINE:`);
console.log(`   État: ${seedState}`);
console.log(`   Progression: ${Math.round(seedProgress * 100)}%`);

const seedEmojis = {
  'seed': '🌰',
  'sprout': '🌱', 
  'small_tree': '🌲',
  'tree': '🌳'
};
console.log(`   Emoji: ${seedEmojis[seedState]}`);

// Analyse de la progression
const entriesArray = Object.values(dailyEntries);
const totalDays = entriesArray.length;
const successfulDays = entriesArray.filter(e => e.objectiveMet).length;
const successRate = (successfulDays / totalDays * 100).toFixed(1);

console.log(`\n📈 ANALYSE DE PROGRESSION:`);
console.log(`   Jours total: ${totalDays}`);
console.log(`   Jours réussis: ${successfulDays}`);
console.log(`   Taux de réussite: ${successRate}%`);

// Frise des 7 jours (les 7 derniers jours)
console.log(`\n📅 FRISE DES 7 DERNIERS JOURS:`);
const last7Days = entriesArray.slice(-7);
last7Days.forEach((entry, index) => {
  const dayNumber = totalDays - 7 + index + 1;
  const status = entry.objectiveMet ? '✅' : '❌';
  console.log(`   Jour ${dayNumber}: ${entry.realCigs}/${entry.goalCigs} cigarettes ${status}`);
});

console.log(`\n✅ RÉSUMÉ:`);
console.log(`   Cigarettes évitées: ${cigarettesAvoided}`);
console.log(`   Économies: ${moneySaved.toFixed(2)}€`);
console.log(`   Streak: ${streak} jours`);
console.log(`   Graine: ${seedEmojis[seedState]} (${seedState})`);
console.log(`   Progression: ${Math.round(seedProgress * 100)}%`);

console.log(`\n🔧 PROBLÈMES POTENTIELS À VÉRIFIER:`);
console.log(`   1. Vérifiez que le profil a cigsPerDay = 20`);
console.log(`   2. Vérifiez que les entrées sont dans l'ordre chronologique`);
console.log(`   3. Vérifiez que le streak pointe vers la dernière date`);
console.log(`   4. Vérifiez que l'application utilise calculateConnectionStreak`);
console.log(`   5. Vérifiez que la frise utilise les 7 derniers jours`);
