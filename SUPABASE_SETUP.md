# Guide de configuration Supabase pour MyQuitZone

## 🚀 Étapes de configuration

### 1. Configuration de Supabase

1. **Créer un projet Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un compte ou connectez-vous
   - Cliquez sur "New Project"
   - Nommez votre projet (ex: "quit-smoking-app")
   - Créez un mot de passe de base de données fort
   - Choisissez une région proche de vos utilisateurs

2. **Récupérer les clés d'API**
   - Dans votre projet Supabase, allez dans **Settings** > **API**
   - Copiez :
     - **Project URL** (ex: `https://votre-projet.supabase.co`)
     - **anon public key** (clé publique)

3. **Configurer la base de données**
   - Allez dans l'**éditeur SQL** de votre projet Supabase
   - Copiez et exécutez le contenu du fichier `supabase-schema.sql`
   - Cela créera toutes les tables nécessaires avec les bonnes permissions

### 2. Configuration de l'application

1. **Mettre à jour les clés Supabase**
   - Ouvrez le fichier `src/lib/supabase.ts`
   - Remplacez `YOUR_SUPABASE_URL` par votre Project URL
   - Remplacez `YOUR_SUPABASE_ANON_KEY` par votre clé publique

```typescript
const supabaseUrl = 'https://votre-projet.supabase.co';
const supabaseAnonKey = 'votre-cle-publique-ici';
```

### 3. Test de l'application

1. **Démarrer l'application**
   ```bash
   npm start
   ```

2. **Tester l'authentification**
   - Créez un nouveau compte
   - Connectez-vous
   - Vérifiez que les données se synchronisent

## 📊 Structure de la base de données

L'application utilise les tables suivantes :

- `user_profiles` - Profils utilisateurs et données d'onboarding
- `user_settings` - Paramètres de l'application
- `daily_entries` - Entrées quotidiennes de cigarettes
- `financial_goals` - Objectifs financiers
- `achievements` - Réalisations débloquées
- `user_streaks` - Données de série (streak)

## 🔐 Sécurité

- Toutes les tables utilisent Row Level Security (RLS)
- Chaque utilisateur ne peut accéder qu'à ses propres données
- Les clés publiques sont sécurisées pour l'usage client

## 🔄 Synchronisation des données

L'application utilise une approche hybride :
- **Stockage local** : AsyncStorage pour un accès rapide
- **Stockage distant** : Supabase pour la synchronisation entre appareils
- **Synchronisation automatique** : Les données se synchronisent automatiquement quand l'utilisateur est connecté

## 🛠️ Fonctionnalités d'authentification

- ✅ Inscription avec email/mot de passe
- ✅ Connexion avec email/mot de passe
- ✅ Déconnexion
- ✅ Réinitialisation de mot de passe
- ✅ Persistance de session
- ✅ Synchronisation automatique des données

## 📱 Utilisation

1. **Première utilisation**
   - L'utilisateur voit l'écran de connexion
   - Il peut créer un compte ou se connecter
   - Après authentification, il accède à l'app principale

2. **Utilisation quotidienne**
   - Les données se synchronisent automatiquement
   - L'utilisateur reste connecté entre les sessions
   - Possibilité de se déconnecter dans les paramètres

## 🔧 Dépannage

### Problèmes courants

1. **Erreur de connexion**
   - Vérifiez que les clés Supabase sont correctes
   - Vérifiez votre connexion internet
   - Vérifiez que le projet Supabase est actif

2. **Données non synchronisées**
   - Vérifiez que l'utilisateur est connecté
   - Vérifiez les permissions RLS dans Supabase
   - Consultez les logs de la console

3. **Erreur de base de données**
   - Vérifiez que le schéma SQL a été exécuté
   - Vérifiez que les triggers sont créés
   - Vérifiez les politiques RLS

### Logs utiles

Pour déboguer, consultez :
- Console de l'application React Native
- Logs de Supabase dans le dashboard
- Réseau dans les outils de développement

## 🚀 Prochaines étapes

Une fois la configuration terminée, vous pouvez :

1. **Personnaliser l'interface**
   - Modifier les couleurs et styles
   - Ajouter des animations
   - Personnaliser les messages

2. **Ajouter des fonctionnalités**
   - Notifications push
   - Synchronisation en temps réel
   - Partage de données

3. **Déployer**
   - Build pour iOS/Android
   - Publier sur les stores
   - Configurer le monitoring

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation Supabase
2. Vérifiez les logs d'erreur
3. Testez avec un nouveau projet Supabase si nécessaire

---

**Note** : Gardez vos clés API secrètes et ne les commitez jamais dans votre code source. Utilisez des variables d'environnement en production.
