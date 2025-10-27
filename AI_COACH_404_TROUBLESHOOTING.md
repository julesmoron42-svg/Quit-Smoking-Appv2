# 🔧 Dépannage Erreur 404 - Coach IA

## ❌ Problème identifié

L'erreur 404 indique que l'URL de l'API Gemini n'est pas correcte ou que la clé API n'est pas valide.

## 🔍 Diagnostic

### 1. Vérifier l'URL de l'API
L'URL actuelle dans `aiCoachConfig.ts` :
```typescript
GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key='
```

### 2. Vérifier la clé API
Votre clé API : `AIzaSyCoPHqjxwDN5tLefiKOfh3puwcv11-T1C4`

### 3. URL complète construite
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCoPHqjxwDN5tLefiKOfh3puwcv11-T1C4
```

## 🛠️ Solutions

### Solution 1 : Vérifier la clé API
1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Vérifiez que votre clé API est active
3. Testez avec une nouvelle clé si nécessaire

### Solution 2 : Tester la connexion
Utilisez le script de test créé :
```typescript
import { testGeminiConnection } from '../lib/testGeminiConnection';

// Dans votre composant de test
const result = await testGeminiConnection();
console.log('Test result:', result);
```

### Solution 3 : Vérifier les logs
Les logs de debug ont été ajoutés dans `aiCoachService.ts` :
- `🔍 AICoachService - URL:` - Affiche l'URL complète
- `🔍 AICoachService - Prompt length:` - Affiche la longueur du prompt
- `❌ AICoachService - API Error:` - Affiche les erreurs détaillées

## 🧪 Test rapide

### 1. Test de l'URL
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCoPHqjxwDN5tLefiKOfh3puwcv11-T1C4" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Bonjour"
      }]
    }]
  }'
```

### 2. Test dans l'app
1. Ouvrez le coach IA
2. Envoyez un message simple : "Bonjour"
3. Regardez les logs dans la console
4. Vérifiez l'URL et les erreurs

## 🔧 Corrections apportées

### 1. URL corrigée
- Ajout du paramètre `?key=` à la fin de l'URL de base
- Construction correcte de l'URL complète

### 2. Logs de debug ajoutés
- URL complète affichée
- Longueur du prompt affichée
- Erreurs détaillées affichées

### 3. Script de test créé
- `testGeminiConnection.ts` pour tester la connexion
- Diagnostic complet des erreurs

## 🚀 Prochaines étapes

1. **Testez la connexion** avec le script de test
2. **Vérifiez les logs** dans la console
3. **Vérifiez votre clé API** sur Google AI Studio
4. **Testez un message simple** dans le coach IA

## 📞 Support

Si le problème persiste :
1. Vérifiez que votre clé API est valide
2. Vérifiez que vous avez des crédits disponibles
3. Testez avec une nouvelle clé API
4. Vérifiez les quotas de l'API Gemini

L'erreur 404 devrait être résolue avec ces corrections ! 🎉
