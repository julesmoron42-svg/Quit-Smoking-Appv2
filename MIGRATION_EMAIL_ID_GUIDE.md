# Guide de Migration : Utilisation de l'Email comme User ID

Ce guide vous explique comment migrer votre application Supabase pour utiliser l'email comme user ID au lieu d'un UUID généré automatiquement.

## ⚠️ IMPORTANT : Sauvegardez vos données !

Avant de commencer la migration, **sauvegardez impérativement** toutes vos données existantes.

## Étapes de Migration

### 1. Exécuter le nouveau schéma

Exécutez le contenu du fichier `supabase-schema-email-id.sql` dans l'éditeur SQL de votre projet Supabase. Ce script crée les nouvelles tables avec l'email comme clé primaire.

### 2. Migrer les données existantes

Exécutez le contenu du fichier `migration-to-email-id.sql` dans l'éditeur SQL de votre projet Supabase. Ce script :

- Migre toutes les données existantes des anciennes tables vers les nouvelles
- Utilise l'email de l'utilisateur comme nouvelle clé primaire
- Préserve toutes les données existantes

### 3. Vérifier la migration

Le script de migration inclut des requêtes de vérification pour s'assurer que toutes les données ont été migrées correctement. Vérifiez que les compteurs correspondent entre les anciennes et nouvelles tables.

### 4. Remplacer les anciennes tables

Une fois la migration vérifiée, décommentez et exécutez les dernières lignes du script de migration pour :

- Supprimer les anciennes tables
- Renommer les nouvelles tables avec les noms originaux

### 5. Mettre à jour l'application

Le code de l'application a déjà été modifié pour utiliser l'email comme user ID. Les fichiers modifiés sont :

- `src/lib/storage.ts` : La fonction `getCurrentUserId()` retourne maintenant l'email
- `src/lib/dataSync.ts` : Toutes les méthodes utilisent l'email comme user_id

## Changements Apportés

### Schéma de Base de Données

- **user_profiles** : `id` est maintenant de type `TEXT` (email) au lieu d'`UUID`
- **Toutes les autres tables** : `user_id` est maintenant de type `TEXT` (email) au lieu d'`UUID`

### Politiques RLS

Les politiques de sécurité ont été mises à jour pour utiliser :
```sql
auth.jwt() ->> 'email'
```
au lieu de :
```sql
auth.uid()
```

### Code de l'Application

- `getCurrentUserId()` retourne `session?.user?.email` au lieu de `session?.user?.id`
- Toutes les requêtes Supabase utilisent l'email comme identifiant utilisateur

## Avantages de cette Migration

1. **Simplicité** : L'email est plus lisible et compréhensible qu'un UUID
2. **Debugging** : Plus facile d'identifier les utilisateurs dans les logs
3. **Maintenance** : Plus simple de gérer les données utilisateur
4. **Cohérence** : L'email est déjà utilisé pour l'authentification

## Points d'Attention

1. **Unicité** : Assurez-vous que tous les emails sont uniques
2. **Validation** : L'email doit être valide et non vide
3. **Sécurité** : Les politiques RLS protègent toujours les données utilisateur
4. **Performance** : L'email comme clé primaire peut être légèrement moins performant qu'un UUID, mais la différence est négligeable pour la plupart des applications

## Test de la Migration

Après la migration, testez :

1. **Connexion** : Vérifiez que les utilisateurs peuvent se connecter
2. **Synchronisation** : Testez la sauvegarde et le chargement des données
3. **Sécurité** : Vérifiez que chaque utilisateur ne peut accéder qu'à ses propres données
4. **Performance** : Testez les opérations CRUD principales

## Rollback (si nécessaire)

Si vous devez revenir à l'ancien système :

1. Restaurez vos données depuis la sauvegarde
2. Revenez à l'ancien schéma de base de données
3. Restaurez l'ancien code de l'application

## Support

Si vous rencontrez des problèmes lors de la migration, vérifiez :

1. Les logs de l'éditeur SQL Supabase
2. Les logs de la console de votre application
3. Les politiques RLS sont correctement configurées
4. L'email de l'utilisateur est bien présent dans le JWT

---

**Note** : Cette migration est irréversible une fois les anciennes tables supprimées. Assurez-vous de bien tester avant de finaliser la migration.
