// Script pour tester différents modèles Gemini
// Ce script teste plusieurs configurations pour trouver celle qui fonctionne

import { AI_COACH_CONFIG } from '../config/aiCoachConfig';

const TEST_CONFIGS = [
  {
    name: 'gemini-1.0-pro (v1beta)',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=',
  },
  {
    name: 'gemini-1.0-pro (v1)',
    url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=',
  },
  {
    name: 'gemini-1.5-flash (v1beta)',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=',
  },
  {
    name: 'gemini-1.5-flash (v1)',
    url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=',
  },
  {
    name: 'gemini-1.5-pro (v1beta)',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=',
  },
  {
    name: 'gemini-1.5-pro (v1)',
    url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=',
  },
];

export async function testAllGeminiModels() {
  console.log('🧪 Test de tous les modèles Gemini...');
  console.log('🔑 API Key:', AI_COACH_CONFIG.GEMINI_API_KEY.substring(0, 10) + '...');
  
  const results = [];
  
  for (const config of TEST_CONFIGS) {
    console.log(`\n🔍 Test de ${config.name}...`);
    
    try {
      const url = `${config.url}${AI_COACH_CONFIG.GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Bonjour, peux-tu répondre avec "Test réussi" ?'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const message = data.candidates[0].content.parts[0].text;
          console.log(`✅ ${config.name} - SUCCÈS: ${message}`);
          results.push({ config: config.name, status: 'SUCCESS', message });
        } else {
          console.log(`❌ ${config.name} - Réponse invalide`);
          results.push({ config: config.name, status: 'INVALID_RESPONSE', error: 'Réponse invalide' });
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ ${config.name} - ERREUR ${response.status}: ${errorText}`);
        results.push({ config: config.name, status: 'ERROR', error: `HTTP ${response.status}` });
      }
    } catch (error) {
      console.log(`❌ ${config.name} - EXCEPTION: ${error}`);
      results.push({ config: config.name, status: 'EXCEPTION', error: error.message });
    }
  }
  
  console.log('\n📊 Résultats du test:');
  results.forEach(result => {
    const status = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${status} ${result.config}: ${result.status}`);
  });
  
  const workingConfigs = results.filter(r => r.status === 'SUCCESS');
  if (workingConfigs.length > 0) {
    console.log('\n🎉 Configurations qui fonctionnent:');
    workingConfigs.forEach(config => {
      console.log(`✅ ${config.config}`);
    });
  } else {
    console.log('\n😞 Aucune configuration ne fonctionne. Vérifiez votre clé API.');
  }
  
  return results;
}

// Instructions d'utilisation :
// 1. Importez cette fonction dans votre composant de test
// 2. Appelez testAllGeminiModels() pour tester tous les modèles
// 3. Utilisez la configuration qui fonctionne dans aiCoachConfig.ts
