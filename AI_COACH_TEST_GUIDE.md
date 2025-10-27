# 🧪 Guide de Test du Coach IA

## ✅ Configuration terminée !

Votre clé API Gemini est configurée. Voici comment tester le coach IA :

## ✅ Logs nettoyés !

Tous les messages de console superflus ont été supprimés. Seuls les logs d'erreur essentiels sont conservés pour faciliter le débogage.

### 🔍 Logs conservés (avec préfixes clairs) :
- `❌ AICoach Service Error:` - Erreurs du service IA
- `❌ AICoach Context - Profile Error:` - Erreurs de chargement du profil
- `❌ AICoach Context - Send Message Error:` - Erreurs d'envoi de messages
- `❌ PremiumTab - Load Stats Error:` - Erreurs de chargement des stats

### 🧹 Logs supprimés :
- Messages de debug détaillés
- Logs de navigation
- Messages de chargement répétitifs
- Informations de test verbeuses

## 🚀 Test rapide

### 1. Test de l'API Gemini

Ajoutez ce code dans un composant de test :

```typescript
import { testGeminiAPI } from '../lib/testGeminiAPI';

// Dans votre composant
const handleTestAPI = async () => {
  const success = await testGeminiAPI();
  if (success) {
    Alert.alert('✅ Succès', 'L\'API Gemini fonctionne !');
  } else {
    Alert.alert('❌ Erreur', 'Problème avec l\'API Gemini');
  }
};
```

### 2. Test de l'interface utilisateur

1. **Lancez l'application**
2. **Connectez-vous** avec un compte utilisateur
3. **Activez le mode premium** (simulé) :
   - Allez dans l'onglet Premium
   - Cliquez sur "S'abonner" pour activer le mode premium simulé
4. **Retournez à l'écran principal**
5. **Cliquez sur le bouton "Coach IA"** 💬
6. **Testez l'interface** :
   - Tapez un message
   - Utilisez les suggestions
   - Vérifiez que les réponses arrivent

### 3. Test complet

```typescript
import { runAllTests } from '../lib/testAICoach';

// Test complet
const handleFullTest = async () => {
  const success = await runAllTests();
  console.log('Tests:', success ? '✅ Réussis' : '❌ Échoués');
};
```

## 🔍 Vérifications

### ✅ Checklist de test

- [ ] L'API Gemini répond (test `testGeminiAPI`)
- [ ] Le bouton Coach IA s'affiche dans MainTab
- [ ] L'interface de chat s'ouvre correctement
- [ ] Les messages utilisateur s'affichent
- [ ] Les réponses du coach arrivent
- [ ] L'historique se sauvegarde
- [ ] Les suggestions fonctionnent
- [ ] La gestion premium/gratuit fonctionne

### 🐛 Problèmes courants

#### "API Error: 400"
- ✅ **Résolu** : Votre clé API est configurée
- Vérifiez que l'API Gemini est activée dans Google AI Studio

#### "Contexte utilisateur non disponible"
- Assurez-vous que l'utilisateur est connecté
- Vérifiez que les tables Supabase sont créées

#### Messages ne s'affichent pas
- Vérifiez la connexion internet
- Consultez les logs de la console

## 🎯 Prochaines étapes

1. **Créez les tables Supabase** avec `ai-coach-supabase-tables.sql`
2. **Testez avec un utilisateur premium**
3. **Personnalisez les prompts** selon vos besoins
4. **Ajustez les limites d'usage** si nécessaire

## 🎉 Prêt à utiliser !

Votre coach IA est maintenant configuré et prêt à accompagner vos utilisateurs ! 🌱

**Note de sécurité** : Gardez votre clé API secrète et ne la partagez jamais publiquement.
