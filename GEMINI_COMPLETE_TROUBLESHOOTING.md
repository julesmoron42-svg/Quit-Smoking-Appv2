# 🔧 Dépannage Complet - Erreur 404 Gemini API

## ❌ Problème persistant

Malgré les corrections, l'erreur 404 persiste. Le problème peut venir de plusieurs sources :

### 🔍 Causes possibles :
1. **Modèle non disponible** dans votre région
2. **Version API incorrecte** (v1beta vs v1)
3. **Clé API invalide** ou expirée
4. **Quotas dépassés** ou compte suspendu
5. **Région géographique** non supportée

## 🧪 Tests de diagnostic

### 1. Test de tous les modèles
Utilisez le script `testAllGeminiModels.ts` :
```typescript
import { testAllGeminiModels } from '../lib/testAllGeminiModels';

// Teste tous les modèles et versions
const results = await testAllGeminiModels();
```

### 2. Test de la clé API
Vérifiez votre clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey) :
- ✅ Clé active et valide
- ✅ Quotas disponibles
- ✅ Région supportée

### 3. Test avec curl
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=AIzaSyCoPHqjxwDN5tLefiKOfh3puwcv11-T1C4" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Bonjour"
      }]
    }]
  }'
```

## 🔧 Solutions alternatives

### Solution 1 : Modèle gemini-1.0-pro
```typescript
// Configuration actuelle (testée)
MODEL: 'gemini-1.0-pro',
GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=',
```

### Solution 2 : Version v1
```typescript
// Alternative avec version v1
GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=',
```

### Solution 3 : Nouvelle clé API
1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une nouvelle clé API
3. Remplacez dans `aiCoachConfig.ts`

## 🌍 Problèmes géographiques

### Régions supportées :
- ✅ **États-Unis** : Tous les modèles
- ✅ **Europe** : Modèles limités
- ❌ **Certains pays** : Accès restreint

### Solution si problème géographique :
1. **VPN** vers une région supportée
2. **Proxy** pour contourner les restrictions
3. **Alternative** : Utiliser une autre API (OpenAI, Claude)

## 🔄 Configuration de fallback

### Option 1 : Modèle de secours
```typescript
const FALLBACK_CONFIGS = [
  'gemini-1.0-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

// Tester chaque configuration jusqu'à ce qu'une fonctionne
```

### Option 2 : API alternative
```typescript
// Si Gemini ne fonctionne pas, utiliser OpenAI
const USE_OPENAI_FALLBACK = true;
const OPENAI_API_KEY = 'your-openai-key';
```

## 📊 Diagnostic étape par étape

### Étape 1 : Vérifier la clé API
```typescript
// Test simple de la clé
const testKey = async () => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  console.log('Key test:', response.status);
};
```

### Étape 2 : Lister les modèles disponibles
```typescript
// Lister tous les modèles disponibles
const listModels = async () => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  const data = await response.json();
  console.log('Available models:', data);
};
```

### Étape 3 : Tester chaque modèle
Utilisez le script `testAllGeminiModels.ts` pour tester tous les modèles.

## 🚨 Solutions d'urgence

### Si rien ne fonctionne :

1. **Vérifiez votre connexion internet**
2. **Testez avec une nouvelle clé API**
3. **Vérifiez les quotas sur Google Cloud**
4. **Contactez le support Google AI**

### Alternative temporaire :
```typescript
// Mode simulation pour les tests
const SIMULATION_MODE = true;

if (SIMULATION_MODE) {
  return {
    message: "Réponse simulée du coach IA (mode test)",
    success: true,
    tokenCount: 0
  };
}
```

## 📞 Support

### Ressources utiles :
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Documentation Gemini API](https://cloud.google.com/gemini/docs)
- [Forum Google AI](https://discuss.ai.google.dev/)

### Informations à fournir :
- Clé API (partiellement masquée)
- Région géographique
- Message d'erreur complet
- Logs de debug

## ✅ Prochaines étapes

1. **Exécutez le test complet** avec `testAllGeminiModels.ts`
2. **Vérifiez votre clé API** sur Google AI Studio
3. **Testez avec curl** pour isoler le problème
4. **Contactez le support** si nécessaire

Le problème devrait être résolu avec ces diagnostics ! 🔧
