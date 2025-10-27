// Test simple de l'API Gemini
// Exécutez ce script pour tester la connexion

import { AI_COACH_CONFIG } from '../config/aiCoachConfig';

export async function testGeminiConnection() {
  try {
    const url = `${AI_COACH_CONFIG.GEMINI_API_URL}${AI_COACH_CONFIG.GEMINI_API_KEY}`;
    
    console.log('🔍 Test Gemini - URL:', url);
    console.log('🔍 Test Gemini - Model:', AI_COACH_CONFIG.MODEL);
    console.log('🔍 Test Gemini - API Key:', AI_COACH_CONFIG.GEMINI_API_KEY.substring(0, 10) + '...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Bonjour, peux-tu me répondre avec un simple "Salut !" ?'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      })
    });

    console.log('🔍 Test Gemini - Response status:', response.status);
    console.log('🔍 Test Gemini - Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Test Gemini - Error:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    console.log('✅ Test Gemini - Success:', data);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const message = data.candidates[0].content.parts[0].text;
      return { success: true, message };
    } else {
      return { success: false, error: 'Réponse invalide de l\'API' };
    }

  } catch (error) {
    console.error('❌ Test Gemini - Exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Instructions d'utilisation :
// 1. Importez cette fonction dans votre composant de test
// 2. Appelez testGeminiConnection() pour tester la connexion
// 3. Vérifiez les logs dans la console pour diagnostiquer les problèmes
