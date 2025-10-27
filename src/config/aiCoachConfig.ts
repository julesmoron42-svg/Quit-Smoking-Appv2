// Configuration pour le Coach IA
// Remplacez YOUR_GEMINI_API_KEY par votre vraie clé API Gemini

export const AI_COACH_CONFIG = {
  // Clé API Gemini Pro - Obtenez-la sur https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: 'AIzaSyCoPHqjxwDN5tLefiKOfh3puwcv11-T1C4',
  
  // Configuration des modèles
  MODEL: 'gemini-1.0-pro',
  MAX_TOKENS: 300,
  TEMPERATURE: 0.7,
  
  // Limites d'usage
  FREE_USER_LIMIT: 5, // Messages par jour pour les utilisateurs gratuits
  PREMIUM_USER_LIMIT: 50, // Messages par jour pour les utilisateurs premium
  
  // URLs
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=',
};

// Instructions pour obtenir votre clé API Gemini :
// 1. Allez sur https://makersuite.google.com/app/apikey
// 2. Connectez-vous avec votre compte Google
// 3. Cliquez sur "Create API Key"
// 4. Copiez la clé générée
// 5. Remplacez 'YOUR_GEMINI_API_KEY' par votre vraie clé
// 6. Gardez cette clé secrète et ne la partagez jamais publiquement
