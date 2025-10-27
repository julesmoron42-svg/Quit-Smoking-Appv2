# 🤖 Guide d'installation du Coach IA

## ✅ Implémentation terminée !

Le coach IA a été intégré avec succès dans votre application. Voici ce qui a été créé :

### 📁 Fichiers créés/modifiés

#### Nouveaux fichiers :
- `src/lib/aiCoachService.ts` - Service principal pour l'intégration Gemini Pro
- `src/contexts/AICoachContext.tsx` - Contexte React pour gérer les conversations
- `src/screens/AICoachScreen.tsx` - Interface de chat complète
- `src/components/ChatMessageComponent.tsx` - Composant pour afficher les messages
- `src/config/aiCoachConfig.ts` - Configuration de l'API Gemini
- `ai-coach-supabase-tables.sql` - Tables Supabase pour stocker les conversations

#### Fichiers modifiés :
- `App.tsx` - Ajout du provider AICoachProvider
- `src/screens/MainTab.tsx` - Intégration du bouton Coach IA

## 🔧 Configuration requise

### 1. Obtenir une clé API Gemini

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez la clé générée

### 2. Configurer la clé API ✅

✅ **Clé API configurée !** Votre clé Gemini est maintenant active dans `src/config/aiCoachConfig.ts`.

Pour tester la connexion, vous pouvez utiliser le fichier `src/lib/testGeminiAPI.ts` :
```typescript
import { testGeminiAPI } from '../lib/testGeminiAPI';
await testGeminiAPI(); // Teste la connexion à l'API
```

### 3. Créer les tables Supabase

Exécutez le fichier `ai-coach-supabase-tables.sql` dans votre console Supabase :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans "SQL Editor"
4. Copiez-collez le contenu de `ai-coach-supabase-tables.sql`
5. Cliquez sur "Run"

## 🚀 Fonctionnalités implémentées

### ✅ Interface utilisateur
- Interface de chat moderne et intuitive
- Messages avec bulles différenciées (utilisateur/coach)
- Animation de frappe pendant la génération
- Suggestions de messages contextuelles
- Gestion des erreurs avec messages d'erreur

### ✅ Intelligence artificielle
- Intégration Gemini Pro (gratuite)
- Prompts spécialisés pour l'arrêt du tabac
- Contexte utilisateur personnalisé (profil, statistiques, progression)
- Réponses adaptées au niveau de progression
- Limitation des tokens pour optimiser les coûts

### ✅ Gestion des données
- Stockage des conversations dans Supabase
- Sauvegarde automatique des échanges
- Historique des conversations
- Statistiques d'usage
- Sécurité RLS (Row Level Security)

### ✅ Système premium
- Vérification du statut premium
- Limitation pour les utilisateurs gratuits
- Redirection vers l'abonnement si nécessaire
- Messages de bienvenue personnalisés

## 🎯 Utilisation

### Pour les utilisateurs premium :
1. Cliquez sur le bouton "Coach IA" dans l'écran principal
2. Tapez votre message ou utilisez les suggestions
3. Recevez des conseils personnalisés basés sur votre profil
4. Consultez l'historique de vos conversations

### Pour les utilisateurs gratuits :
- Le bouton affiche une alerte pour s'abonner
- Redirection vers l'onglet Premium

## 🔒 Sécurité

- Clé API stockée côté client (à sécuriser en production)
- Politiques RLS sur toutes les tables
- Validation des données utilisateur
- Limitation des tokens pour éviter les abus

## 💰 Coûts

- **Gemini Pro** : Gratuit jusqu'à 60 requêtes/minute
- **Supabase** : Utilise votre quota existant
- **Pas de coût supplémentaire** pour commencer

## 🐛 Dépannage

### Erreur "API Error: 400"
- Vérifiez que votre clé API Gemini est correcte
- Assurez-vous que l'API Gemini est activée

### Erreur "Contexte utilisateur non disponible"
- Vérifiez que l'utilisateur est connecté
- Assurez-vous que les tables Supabase sont créées

### Messages ne s'affichent pas
- Vérifiez la connexion internet
- Consultez les logs de la console pour plus de détails

## 🎉 Prochaines étapes

1. **Testez** le coach IA avec un utilisateur premium
2. **Personnalisez** les prompts selon vos besoins
3. **Ajustez** les limites d'usage si nécessaire
4. **Ajoutez** des fonctionnalités avancées (rappels, conseils proactifs)

Le coach IA est maintenant prêt à accompagner vos utilisateurs dans leur parcours d'arrêt du tabac ! 🌱
