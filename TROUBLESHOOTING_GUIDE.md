# 🔧 Guide de Dépannage - Erreurs de Synchronisation

## ✅ Corrections Appliquées

J'ai corrigé les problèmes suivants qui causaient des erreurs de synchronisation :

### 1. **Boucles Infinies Éliminées**
- ✅ Supprimé la synchronisation automatique dans les fonctions de stockage
- ✅ Ajouté des gardes pour éviter les appels récursifs
- ✅ Simplifié le système de synchronisation

### 2. **Import Errors Corrigés**
- ✅ Exporté la fonction `getCurrentUserId` depuis `storage.ts`
- ✅ Corrigé les imports dans `testSync.ts`

### 3. **Synchronisation Temporairement Désactivée**
- ✅ Désactivé la synchronisation automatique lors de la connexion/déconnexion
- ✅ Gardé la synchronisation manuelle via le bouton de test

## 🧪 Comment Tester Maintenant

### 1. **Test Basique**
1. **Ouvrez l'app** dans Expo Go
2. **Connectez-vous** avec votre compte
3. **Appuyez sur le bouton "🧪 Test Sync"**
4. **Regardez la console** pour voir les logs

### 2. **Logs à Surveiller**
Vous devriez voir quelque chose comme :
```
🧪 Test de synchronisation des données par utilisateur
👤 Utilisateur connecté: Oui (user-id-here)
🔍 Test de connexion Supabase...
✅ Connexion Supabase OK
📱 Chargement des données locales...
📊 Données locales:
  - Profil: ✅ {startedSmokingYears: 0, cigsPerDay: 20, ...}
  - Paramètres: ✅ {pricePerCig: 0.6, currency: "€", ...}
  - Entrées: 0 entrées
  - Série: 0 jours
🔄 Test de synchronisation manuelle...
✅ Synchronisation manuelle réussie
✅ Test de synchronisation terminé
```

## 🚨 Erreurs Possibles et Solutions

### **Erreur: "Aucun utilisateur connecté"**
**Cause:** Vous n'êtes pas connecté à l'application
**Solution:** 
1. Connectez-vous via l'écran d'authentification
2. Vérifiez que votre session est active

### **Erreur: "Erreur de connexion Supabase"**
**Cause:** Problème de connexion réseau ou configuration Supabase
**Solutions:**
1. Vérifiez votre connexion internet
2. Vérifiez les clés Supabase dans `src/lib/supabase.ts`
3. Vérifiez que votre projet Supabase est actif

### **Erreur: "Erreur de synchronisation manuelle"**
**Cause:** Problème avec les tables Supabase ou les permissions
**Solutions:**
1. Vérifiez que les tables existent dans Supabase
2. Vérifiez les permissions RLS (Row Level Security)
3. Vérifiez la structure des tables

## 🔍 Diagnostic Avancé

### **Vérifier les Tables Supabase**
Connectez-vous à votre dashboard Supabase et vérifiez que ces tables existent :
- `user_profiles`
- `user_settings`
- `daily_entries`
- `user_streaks`
- `financial_goals`
- `achievements`

### **Vérifier les Permissions RLS**
Assurez-vous que chaque table a les bonnes politiques RLS :
```sql
-- Exemple pour user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);
```

### **Vérifier la Configuration Supabase**
Dans `src/lib/supabase.ts`, vérifiez que :
- L'URL est correcte
- La clé anonyme est correcte
- Les paramètres d'auth sont bien configurés

## 📱 Test Multi-Appareils

Une fois que le test basique fonctionne :

1. **Sur Expo Go** : Connectez-vous et ajoutez des données
2. **Sur votre ordinateur** : Connectez-vous avec le même email
3. **Vérifiez** que vous voyez les mêmes données

## 🆘 Si Ça Ne Marche Toujours Pas

### **Étapes de Dépannage**

1. **Partagez les logs exacts** de la console Expo
2. **Vérifiez votre connexion internet**
3. **Redémarrez l'application** Expo Go
4. **Vérifiez le statut de Supabase** (dashboard.supabase.com)

### **Logs Importants à Partager**
- Les messages d'erreur exacts
- L'ID de l'utilisateur connecté
- Les données locales chargées
- Les erreurs de connexion Supabase

## 🎯 Prochaines Étapes

Une fois que les erreurs sont résolues, nous pourrons :
1. **Réactiver la synchronisation automatique**
2. **Implémenter la synchronisation en temps réel**
3. **Ajouter la gestion des conflits de données**
4. **Optimiser les performances**

---

**Note:** Les corrections appliquées ont temporairement désactivé la synchronisation automatique pour éliminer les erreurs. Une fois que tout fonctionne, nous pourrons la réactiver progressivement.

