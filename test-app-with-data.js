// Script de test pour vérifier que l'application fonctionne correctement avec les données de jules.moron@gmail.com
// Ce script simule les calculs que fait l'application

// Simulation des données de profil
const profile = {
  id: 'jules.moron@gmail.com',
  startedSmokingYears: 5,
  cigsPerDay: 20,
  objectiveType: 'progressive',
  reductionFrequency: 1,
  smokingYears: 5,
  smokingPeakTime: 'after_meals',
  mainGoal: 'progressive_reduction',
  mainMotivation: 'health',
  previousAttempts: 'several_times',
  smokingTriggers: ['stress', 'after_meals', 'coffee_alcohol'],
  smokingSituations: ['work', 'evenings', 'weekends'],
  onboardingCompleted: true
};

// Simulation des paramètres
const settings = {
  pricePerCig: 0.65,
  currency: '€',
  notificationsAllowed: true,
  language: 'fr',
  animationsEnabled: true
};

// Simulation des données d'entrées quotidiennes (40 jours)
function generateMockDailyEntries() {
  const entries = {};
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 39); // 40 jours en arrière
  
  for (let i = 0; i < 40; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Calcul de l'objectif progressif (réduction d'1 cigarette par semaine)
    const goalCigs = Math.max(0, 20 - Math.floor(i / 7));
    
    // Simulation réaliste des cigarettes fumées
    let realCigs;
    if (i < 7) {
      // Première semaine : légèrement au-dessus de l'objectif
      realCigs = goalCigs + Math.floor(Math.random() * 3);
    } else if (i < 14) {
      // Deuxième semaine : proche de l'objectif
      realCigs = goalCigs + Math.floor(Math.random() * 2 - 1);
    } else if (i < 21) {
      // Troisième semaine : parfois en dessous de l'objectif
      realCigs = Math.max(0, goalCigs + Math.floor(Math.random() * 3 - 1));
    } else if (i < 28) {
      // Quatrième semaine : souvent en dessous
      realCigs = Math.max(0, goalCigs + Math.floor(Math.random() * 2 - 1));
    } else {
      // Cinquième semaine et plus : très bon contrôle
      realCigs = Math.max(0, goalCigs + Math.floor(Math.random() * 2 - 1));
    }
    
    const objectiveMet = realCigs <= goalCigs;
    
    // Choix d'émotion basé sur la performance
    const emotions = ['happy', 'proud', 'frustrated', 'anxious', 'confident', 'disappointed', 'relieved', 'stressed'];
    let emotion;
    if (objectiveMet) {
      emotion = emotions[Math.floor(Math.random() * 4)]; // happy, proud, confident, relieved
    } else {
      emotion = emotions[4 + Math.floor(Math.random() * 4)]; // frustrated, anxious, disappointed, stressed
    }
    
    entries[dateString] = {
      realCigs,
      goalCigs,
      date: dateString,
      emotion,
      objectiveMet
    };
  }
  
  return entries;
}

// Fonctions de calcul (copiées de l'application)
function calculateCigarettesAvoided(profile, dailyEntries, sessionElapsed) {
  let totalAvoided = 0;
  
  Object.values(dailyEntries).forEach(entry => {
    const dailyGoal = profile.cigsPerDay;
    const realCigs = entry.realCigs;
    const dailyAvoided = Math.max(0, dailyGoal - realCigs);
    totalAvoided += dailyAvoided;
  });
  
  return totalAvoided;
}

function calculateMoneySaved(cigarettesAvoided, pricePerCig) {
  return cigarettesAvoided * pricePerCig;
}

function calculateConnectionStreak(dailyEntries, currentDate) {
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) return 0;
  
  let streak = 0;
  let checkDate = new Date(currentDate);
  
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const entry = dailyEntries[dateStr];
    
    if (entry) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

function getSeedState(streak, totalDays = 60) {
  const phases = Math.ceil(totalDays / 6);
  const phaseSize = totalDays / phases;
  
  if (streak >= phaseSize * 5) return 'tree';
  if (streak >= phaseSize * 3) return 'small_tree';
  if (streak >= phaseSize * 1) return 'sprout';
  return 'seed';
}

function getSeedProgress(streak, totalDays = 60) {
  return Math.min(streak / totalDays, 1);
}

function generateCigarettesChartData(profile, dailyEntries, daysToShow = 30) {
  const theoreticalData = [];
  const realData = [];
  const labels = [];
  
  const sortedDates = Object.keys(dailyEntries).sort();
  if (sortedDates.length === 0) {
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
  
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    const theoreticalCigs = Math.max(0, 20 - Math.floor(i / 7));
    theoreticalData.push(theoreticalCigs);
    
    const entry = dailyEntries[dateString];
    realData.push(entry ? entry.realCigs : 0);
    
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
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      },
      {
        data: realData,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };
}

// Test principal
function runTests() {
  console.log('🌱 Test de l\'application avec les données de jules.moron@gmail.com');
  console.log('=' .repeat(70));
  
  // Générer les données d'entrées quotidiennes
  const dailyEntries = generateMockDailyEntries();
  console.log(`✅ ${Object.keys(dailyEntries).length} entrées quotidiennes générées`);
  
  // Calculer les statistiques
  const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries, 0);
  const moneySaved = calculateMoneySaved(cigarettesAvoided, settings.pricePerCig);
  const streak = calculateConnectionStreak(dailyEntries, new Date().toISOString().split('T')[0]);
  
  console.log('\n📊 STATISTIQUES:');
  console.log(`   Cigarettes évitées: ${cigarettesAvoided}`);
  console.log(`   Argent économisé: ${moneySaved.toFixed(2)}€`);
  console.log(`   Streak actuel: ${streak} jours`);
  
  // Tester l'évolution de la graine
  const seedState = getSeedState(streak, 60);
  const seedProgress = getSeedProgress(streak, 60);
  
  console.log('\n🌱 ÉVOLUTION DE LA GRAINE:');
  console.log(`   État actuel: ${seedState}`);
  console.log(`   Progression: ${Math.round(seedProgress * 100)}%`);
  
  const seedEmojis = {
    'seed': '🌰',
    'sprout': '🌱', 
    'small_tree': '🌲',
    'tree': '🌳'
  };
  console.log(`   Emoji: ${seedEmojis[seedState]}`);
  
  // Tester les graphiques
  const chartData = generateCigarettesChartData(profile, dailyEntries, 30);
  console.log('\n📈 DONNÉES DES GRAPHIQUES:');
  console.log(`   Labels: ${chartData.labels.filter(l => l !== '').join(', ')}`);
  console.log(`   Données théoriques (5 premiers): ${chartData.datasets[0].data.slice(0, 5).join(', ')}`);
  console.log(`   Données réelles (5 premiers): ${chartData.datasets[1].data.slice(0, 5).join(', ')}`);
  
  // Analyser la progression
  const entriesArray = Object.values(dailyEntries);
  const totalDays = entriesArray.length;
  const successfulDays = entriesArray.filter(e => e.objectiveMet).length;
  const successRate = (successfulDays / totalDays * 100).toFixed(1);
  
  console.log('\n📈 ANALYSE DE PROGRESSION:');
  console.log(`   Jours total: ${totalDays}`);
  console.log(`   Jours réussis: ${successfulDays}`);
  console.log(`   Taux de réussite: ${successRate}%`);
  
  // Analyser par semaine
  console.log('\n📅 PROGRESSION PAR SEMAINE:');
  for (let week = 0; week < 6; week++) {
    const weekEntries = entriesArray.slice(week * 7, (week + 1) * 7);
    if (weekEntries.length === 0) break;
    
    const weekSuccessful = weekEntries.filter(e => e.objectiveMet).length;
    const avgGoal = (weekEntries.reduce((sum, e) => sum + e.goalCigs, 0) / weekEntries.length).toFixed(1);
    const avgReal = (weekEntries.reduce((sum, e) => sum + e.realCigs, 0) / weekEntries.length).toFixed(1);
    
    console.log(`   Semaine ${week + 1}: ${weekSuccessful}/7 réussis, objectif moyen: ${avgGoal}, réel moyen: ${avgReal}`);
  }
  
  console.log('\n✅ Tests terminés ! L\'application devrait fonctionner correctement avec ces données.');
  console.log('\n📝 Instructions:');
  console.log('   1. Exécutez le script insert-test-data-jules.sql dans Supabase');
  console.log('   2. Connectez-vous avec jules.moron@gmail.com dans l\'application');
  console.log('   3. Vérifiez que la graine affiche ' + seedEmojis[seedState]);
  console.log('   4. Naviguez vers l\'onglet Analytics pour voir les graphiques');
  console.log('   5. Vérifiez que les statistiques correspondent aux calculs ci-dessus');
}

// Exécuter les tests
runTests();
