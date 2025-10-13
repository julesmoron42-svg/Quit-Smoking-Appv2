# 🔧 Guide de Correction - Schéma de Base de Données

## 🚨 Problème Identifié

Les erreurs que vous voyez indiquent que les colonnes dans votre base de données Supabase ne correspondent pas à ce que le code TypeScript attend :

- ❌ `couldn't find goalcigs of daily_entries` → La colonne `goal_cigs` manque
- ❌ `could not find current streak column of user streaks` → La colonne `current_streak` manque  
- ❌ `could not find cigsperday column of userprofiles` → La colonne `cigs_per_day` manque
- ❌ `could not find animationsenabled column of usersettings` → La colonne `animations_enabled` manque

## ✅ Solutions Appliquées

### 1. **Correction du Mapping des Colonnes**
J'ai corrigé le service `DataSyncService` pour mapper correctement entre :
- **camelCase** (TypeScript) ↔ **snake_case** (Base de données)
- `goalCigs` ↔ `goal_cigs`
- `currentStreak` ↔ `current_streak`
- `cigsPerDay` ↔ `cigs_per_day`
- `animationsEnabled` ↔ `animations_enabled`

### 2. **Script SQL de Correction**
J'ai créé un script `fix_missing_columns.sql` pour ajouter les colonnes manquantes.

## 🛠️ Comment Corriger

### **Étape 1 : Exécuter le Script SQL**
1. **Connectez-vous** à votre dashboard Supabase
2. **Allez dans** l'éditeur SQL
3. **Copiez et exécutez** le contenu du fichier `fix_missing_columns.sql`
4. **Vérifiez** que toutes les colonnes sont créées

### **Étape 2 : Vérifier les Tables**
Le script affichera un tableau avec toutes les colonnes. Vérifiez que vous avez :

#### **Table `user_profiles`**
- ✅ `cigs_per_day` (INTEGER)
- ✅ `started_smoking_years` (INTEGER)
- ✅ `objective_type` (TEXT)

#### **Table `user_settings`**
- ✅ `animations_enabled` (BOOLEAN)
- ✅ `price_per_cig` (DECIMAL)
- ✅ `currency` (TEXT)

#### **Table `daily_entries`**
- ✅ `goal_cigs` (INTEGER)
- ✅ `real_cigs` (INTEGER)
- ✅ `objective_met` (BOOLEAN)

#### **Table `user_streaks`**
- ✅ `current_streak` (INTEGER)
- ✅ `last_date_connected` (DATE)

### **Étape 3 : Tester la Synchronisation**
1. **Rechargez** votre application Expo Go
2. **Connectez-vous** avec votre compte
3. **Appuyez sur** le bouton "🧪 Test Sync"
4. **Vérifiez** que les erreurs ont disparu

## 📊 Logs Attendus Après Correction

Vous devriez maintenant voir :
```
🧪 Test de synchronisation des données par utilisateur
👤 Utilisateur connecté: Oui (votre-user-id)
🔍 Test de connexion Supabase...
✅ Connexion Supabase OK
📱 Chargement des données locales...
📊 Données locales: [vos données]
🔄 Test de synchronisation manuelle...
✅ Synchronisation manuelle réussie
✅ Test de synchronisation terminé
```

## 🚨 Si Ça Ne Marche Toujours Pas

### **Vérifications Supplémentaires**

1. **Vérifiez les Permissions RLS**
   - Assurez-vous que les politiques RLS sont activées
   - Vérifiez que vous avez les bonnes permissions

2. **Vérifiez la Structure des Tables**
   ```sql
   -- Exécutez cette requête pour voir la structure
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'user_profiles';
   ```

3. **Testez une Requête Simple**
   ```sql
   -- Testez si vous pouvez lire vos données
   SELECT * FROM user_profiles WHERE id = 'votre-user-id';
   ```

### **Problèmes Courants**

- **Tables n'existent pas** : Exécutez le script `supabase-schema.sql` complet
- **Permissions refusées** : Vérifiez les politiques RLS
- **Colonnes toujours manquantes** : Exécutez le script `fix_missing_columns.sql`

## 🎯 Prochaines Étapes

Une fois que le schéma est corrigé :
1. ✅ **Test de synchronisation** : Vérifier que tout fonctionne
2. ✅ **Test multi-appareils** : Vérifier la synchronisation entre appareils
3. ✅ **Réactivation progressive** : Réactiver la synchronisation automatique

---

**Note:** Le problème était un mismatch entre les noms de colonnes camelCase (TypeScript) et snake_case (PostgreSQL). J'ai corrigé le mapping dans le code, mais il faut aussi s'assurer que les colonnes existent dans la base de données.

