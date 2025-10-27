# 🚀 Test du Coach IA - Guide Rapide

## ✅ Configuration terminée !

Le coach IA est maintenant configuré et prêt à être testé. Voici ce qui a été fait :

### 🔧 Corrections apportées :
1. **Mode Premium activé** : `isPremium = true` dans `SubscriptionContextMock.tsx`
2. **Bouton Coach IA corrigé** : Plus de "Bientôt disponible" dans `PremiumTab.tsx`
3. **Tables Supabase créées** : `user_streaks` et tables du coach IA
4. **Logs nettoyés** : Console plus propre pour le débogage

## 🧪 Test du Coach IA

### 1. Vérifier l'accès
- Ouvrez l'application
- Allez sur l'écran principal
- Cliquez sur le bouton "🤖 Coach IA" (en bas à droite)
- L'interface du coach devrait s'ouvrir

### 2. Test de conversation
- Tapez un message comme : "Bonjour, j'ai envie de fumer"
- Appuyez sur "Envoyer"
- Le coach devrait répondre avec des conseils personnalisés

### 3. Vérifier les fonctionnalités
- ✅ Messages utilisateur/coach différenciés
- ✅ Animation de frappe pendant la génération
- ✅ Suggestions de messages
- ✅ Bouton pour effacer la conversation
- ✅ Sauvegarde automatique dans Supabase

## 🔍 En cas de problème

### Erreur "Fonctionnalité Premium"
- Vérifiez que `isPremium = true` dans `SubscriptionContextMock.tsx`

### Erreur de base de données
- Exécutez `simple-ai-coach-setup.sql` dans Supabase

### Pas de réponse du coach
- Vérifiez la clé API Gemini dans `src/config/aiCoachConfig.ts`
- Regardez la console pour les erreurs

## 🎯 Fonctionnalités disponibles

### Interface utilisateur
- Chat moderne avec bulles différenciées
- Animation de frappe pendant la génération
- Suggestions de messages contextuelles
- Bouton pour effacer la conversation

### Intelligence artificielle
- Réponses personnalisées basées sur le profil utilisateur
- Conseils adaptés aux statistiques de streak
- Motivation et encouragement
- Informations sur les bienfaits santé

### Persistance des données
- Sauvegarde automatique des conversations
- Chargement de l'historique au démarrage
- Contexte utilisateur stocké pour personnalisation

## 🚀 Prochaines étapes

1. **Testez le coach IA** avec différents types de messages
2. **Vérifiez la personnalisation** des réponses
3. **Testez la sauvegarde** en fermant/rouvrant l'app
4. **Ajustez les prompts** si nécessaire dans `aiCoachService.ts`

Le coach IA est maintenant fonctionnel ! 🎉
