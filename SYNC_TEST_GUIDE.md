# Guide de Test - Synchronisation des Données par Utilisateur

## 🎯 Objectif
Vérifier que les données de l'application sont maintenant synchronisées par compte utilisateur connecté et non plus par appareil.

## 🧪 Comment Tester

### 1. Test Basique de Synchronisation
1. **Connectez-vous** avec votre compte sur l'application
2. **Ajoutez quelques données** (entrées quotidiennes, modifiez votre profil, etc.)
3. **Appuyez sur le bouton "🧪 Test Sync"** dans l'écran principal
4. **Vérifiez les logs** dans la console pour voir la synchronisation

### 2. Test Multi-Appareils
1. **Sur votre premier appareil** (Expo Go) :
   - Connectez-vous avec votre email
   - Ajoutez des données (entrées quotidiennes, modifiez le profil)
   - Vérifiez que les données sont sauvegardées

2. **Sur votre deuxième appareil** (ordinateur/autre device) :
   - Connectez-vous avec le **même email**
   - Vérifiez que vous voyez **les mêmes données** que sur le premier appareil
   - Ajoutez de nouvelles données
   - Retournez sur le premier appareil et vérifiez que les nouvelles données apparaissent

### 3. Test de Changement d'Utilisateur
1. **Connectez-vous** avec un compte (ex: user1@example.com)
2. **Ajoutez des données** spécifiques
3. **Déconnectez-vous**
4. **Connectez-vous** avec un autre compte (ex: user2@example.com)
5. **Vérifiez** que vous ne voyez pas les données de user1
6. **Ajoutez des données** pour user2
7. **Reconnectez-vous** avec user1 et vérifiez que ses données sont toujours là

## 🔍 Que Vérifier

### ✅ Fonctionnalités qui doivent marcher :
- [ ] **Profil utilisateur** : Nombre de cigarettes/jour, objectifs, etc.
- [ ] **Paramètres** : Prix par cigarette, devise, préférences
- [ ] **Entrées quotidiennes** : Historique des cigarettes fumées par jour
- [ ] **Série (streak)** : Nombre de jours consécutifs
- [ ] **Objectifs financiers** : Liste des objectifs d'achat
- [ ] **Réalisations** : Badges et accomplissements

### 🚨 Problèmes à surveiller :
- Les données ne se synchronisent pas entre appareils
- Les données d'un utilisateur apparaissent pour un autre utilisateur
- Perte de données lors de la déconnexion/reconnexion
- Erreurs dans la console lors de la synchronisation

## 🛠️ Debug

### Logs à surveiller :
```
🧪 Test de synchronisation des données par utilisateur
👤 Utilisateur connecté: Oui
📱 Chargement des données locales...
📊 Données locales:
  - Profil: ✅
  - Paramètres: ✅
  - Entrées: X entrées
  - Série: X jours
🔄 Synchronisation avec Supabase...
✅ Synchronisation terminée
```

### En cas de problème :
1. **Vérifiez la connexion internet**
2. **Vérifiez que vous êtes bien connecté** (AuthContext)
3. **Regardez les logs de la console** pour les erreurs Supabase
4. **Testez la connexion à Supabase** directement

## 🎉 Résultat Attendu

Après ces tests, vous devriez constater que :
- ✅ Les données sont **identiques** sur tous vos appareils quand vous êtes connecté avec le même email
- ✅ Les données sont **différentes** quand vous vous connectez avec des emails différents
- ✅ Les données sont **automatiquement synchronisées** quand vous vous connectez/déconnectez
- ✅ Aucune perte de données lors des changements d'utilisateur

## 🧹 Nettoyage

Une fois les tests terminés, vous pouvez :
1. **Supprimer le bouton de test** dans `MainTab.tsx`
2. **Supprimer le fichier** `src/lib/testSync.ts`
3. **Supprimer ce guide** `SYNC_TEST_GUIDE.md`

