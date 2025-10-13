// Script de test pour déboguer les calculs des cigarettes évitées et économies
// Ce script simule exactement ce que fait l'application

// Simulation des données de profil (vérifiez ces valeurs dans votre base)
const profile = {
  cigsPerDay: 20, // IMPORTANT: cette valeur doit correspondre à cigs_per_day dans la base
  objectiveType: 'progressive',
  reductionFrequency: 1
};

// Simulation des paramètres (vérifiez ces valeurs dans votre base)
const settings = {
  pricePerCig: 0.65, // IMPORTANT: cette valeur doit correspondre à price_per_cig dans la base
  currency: '€'
};

// Données d'entrées quotidiennes (40 jours) - copiez les vraies données de votre base
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

// Fonction de calcul des cigarettes évitées (copiée exactement de l'application)
function calculateCigarettesAvoided(profile, dailyEntries, sessionElapsed) {
  console.log('🔍 DEBUG - calculateCigarettesAvoided');
  console.log('   profile.cigsPerDay:', profile.cigsPerDay);
  console.log('   Nombre d\'entrées:', Object.keys(dailyEntries).length);
  
  let totalAvoided = 0;
  let dayCount = 0;
  
  // Parcourir chaque entrée quotidienne
  Object.values(dailyEntries).forEach((entry, index) => {
    dayCount++;
    
    // Cigarettes qui auraient été fumées ce jour selon le profil initial
    const dailyGoal = profile.cigsPerDay;
    
    // Cigarettes réellement fumées ce jour
    const realCigs = entry.realCigs;
    
    // Cigarettes évitées ce jour = différence
    const dailyAvoided = Math.max(0, dailyGoal - realCigs);
    
    totalAvoided += dailyAvoided;
    
    // Log détaillé pour les 5 premiers jours
    if (index < 5) {
      console.log(`   Jour ${dayCount}: ${dailyGoal} - ${realCigs} = ${dailyAvoided} évitées`);
    }
  });
  
  console.log('   Total cigarettes évitées:', totalAvoided);
  return totalAvoided;
}

// Fonction de calcul des économies (copiée exactement de l'application)
function calculateMoneySaved(cigarettesAvoided, pricePerCig) {
  console.log('🔍 DEBUG - calculateMoneySaved');
  console.log('   cigarettesAvoided:', cigarettesAvoided);
  console.log('   pricePerCig:', pricePerCig);
  
  const result = cigarettesAvoided * pricePerCig;
  console.log('   Résultat:', result);
  
  return result;
}

// Test principal
console.log('🔧 DIAGNOSTIC DES CALCULS');
console.log('=' .repeat(50));

console.log('\n📊 CONFIGURATION:');
console.log(`   Profil - cigsPerDay: ${profile.cigsPerDay}`);
console.log(`   Paramètres - pricePerCig: ${settings.pricePerCig}`);
console.log(`   Nombre d'entrées: ${Object.keys(dailyEntries).length}`);

console.log('\n🧮 CALCULS:');

// Calcul des cigarettes évitées
const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries, 0);

// Calcul des économies
const moneySaved = calculateMoneySaved(cigarettesAvoided, settings.pricePerCig);

console.log('\n✅ RÉSULTATS:');
console.log(`   Cigarettes évitées: ${cigarettesAvoided}`);
console.log(`   Économies: ${moneySaved.toFixed(2)}€`);

console.log('\n🔍 POINTS À VÉRIFIER:');
console.log('   1. Le profil dans la base a-t-il cigs_per_day = 20 ?');
console.log('   2. Les paramètres ont-ils price_per_cig = 0.65 ?');
console.log('   3. Les entrées quotidiennes sont-elles correctement chargées ?');
console.log('   4. L\'application utilise-t-elle bien ces fonctions ?');

console.log('\n📝 SI LES VALEURS NE CORRESPONDENT PAS:');
console.log('   1. Vérifiez les valeurs dans la base avec diagnose-data-issues.sql');
console.log('   2. Vérifiez que l\'application charge bien ces données');
console.log('   3. Vérifiez que les calculs sont appelés avec les bonnes données');
console.log('   4. Vérifiez s\'il y a des erreurs dans la console de l\'application');
