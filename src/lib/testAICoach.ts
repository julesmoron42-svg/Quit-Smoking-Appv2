// Test simple pour vérifier l'intégration du Coach IA
// Ce fichier peut être supprimé après les tests

import { aiCoachService } from '../lib/aiCoachService';
import { UserProfile, DailyEntry } from '../types';

// Test de base pour vérifier que le service fonctionne
export const testAICoachService = async () => {
  try {
    // Créer un contexte de test
    const testContext = {
      userProfile: {
        startedSmokingYears: 5,
        cigsPerDay: 20,
        objectiveType: 'complete' as const,
        reductionFrequency: 1,
        age: 30,
        smokingYears: 5,
        mainMotivation: 'health' as const,
        smokingTriggers: ['stress', 'boredom'] as const,
        stressLevel: 7,
        previousAttempts: '1_2_times' as const,
        onboardingCompleted: true,
      } as UserProfile,
      dailyEntries: {
        '2024-01-01': {
          realCigs: 5,
          goalCigs: 0,
          date: '2024-01-01',
          objectiveMet: true,
        } as DailyEntry,
      },
      currentStreak: 3,
      cigarettesAvoided: 45,
      moneySaved: 27.0,
    };

    // Test du message de bienvenue
    const welcomeMessage = aiCoachService.generateWelcomeMessage(testContext);
    console.log('✅ Message de bienvenue généré');

    // Test des suggestions
    const suggestions = aiCoachService.generateMessageSuggestions(testContext);
    console.log('✅ Suggestions générées');

    console.log('🎉 Tests du service réussis !');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    return false;
  }
};

// Fonction pour tester l'interface utilisateur
export const testAICoachUI = () => {
  try {
    // Ces imports devraient fonctionner sans erreur
    const { AICoachProvider } = require('../contexts/AICoachContext');
    const AICoachScreen = require('../screens/AICoachScreen').default;
    const ChatMessageComponent = require('../components/ChatMessageComponent').default;
    
    console.log('✅ Interface utilisateur prête');
    return true;
  } catch (error) {
    console.error('❌ Erreur import composants:', error);
    return false;
  }
};

// Fonction de test complète
export const runAllTests = async () => {
  const serviceTest = await testAICoachService();
  const uiTest = testAICoachUI();
  
  if (serviceTest && uiTest) {
    console.log('🎉 Coach IA prêt !');
    return true;
  } else {
    console.log('❌ Tests échoués');
    return false;
  }
};

// Instructions d'utilisation :
// 1. Importez ce fichier dans votre composant de test
// 2. Appelez runAllTests() pour tester l'intégration complète
// 3. Vérifiez les logs dans la console
// 4. Supprimez ce fichier après les tests
