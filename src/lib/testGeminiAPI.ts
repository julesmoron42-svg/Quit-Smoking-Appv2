// Test rapide de la clé API Gemini
import { aiCoachService } from '../lib/aiCoachService';

export const testGeminiAPI = async () => {
  try {
    // Contexte de test simple
    const testContext = {
      userProfile: {
        startedSmokingYears: 3,
        cigsPerDay: 15,
        objectiveType: 'complete' as const,
        reductionFrequency: 1,
        age: 28,
        smokingYears: 3,
        mainMotivation: 'health' as const,
        smokingTriggers: ['stress'] as const,
        stressLevel: 6,
        previousAttempts: 'first_time' as const,
        onboardingCompleted: true,
      },
      dailyEntries: {},
      currentStreak: 1,
      cigarettesAvoided: 15,
      moneySaved: 9.0,
    };

    // Test d'envoi de message
    const response = await aiCoachService.sendMessage(
      'Salut, je commence mon arrêt du tabac aujourd\'hui. Des conseils ?',
      testContext
    );

    if (response.success) {
      console.log('✅ API Gemini fonctionne !');
      return true;
    } else {
      console.error('❌ Erreur API:', response.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
};

// Instructions :
// 1. Importez cette fonction dans votre composant de test
// 2. Appelez testGeminiAPI() pour vérifier la connexion
// 3. Vérifiez les logs dans la console
