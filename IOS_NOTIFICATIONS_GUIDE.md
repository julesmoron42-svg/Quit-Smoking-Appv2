# 📱 Guide des Notifications iOS

## 🎯 Focus sur iOS

Ce guide se concentre spécifiquement sur les notifications programmées sur iOS avec Expo.

## 🔧 Modifications Apportées

### 1. Configuration iOS Spécifique

```javascript
// Configuration spécifique pour iOS
if (Platform.OS === 'ios') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications par défaut',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}
```

### 2. Format de Trigger Adapté à iOS

**Pour iOS :**
```javascript
trigger: {
  hour: nextNotification.getHours(),
  minute: nextNotification.getMinutes(),
  repeats: true,
}
```

**Pour les autres plateformes :**
```javascript
trigger: {
  seconds: Math.max(1, Math.floor((nextNotification.getTime() - now.getTime()) / 1000)),
  repeats: false,
}
```

### 3. Tests Spécifiques iOS

Le nouveau test inclut 5 formats spécifiquement testés pour iOS :

1. **TEST 1** : Format iOS natif avec `hour` et `minute`
2. **TEST 2** : Format `date` classique
3. **TEST 3** : Format `immédiat` (trigger: null)
4. **TEST 4** : Format iOS avec `repeats: true`
5. **TEST 5** : Format `simple` avec seconds

## 🧪 Comment Tester sur iOS

### 1. Utiliser Expo Go sur iPhone
1. Scannez le QR code avec Expo Go
2. Autorisez les notifications quand demandé
3. Allez dans les paramètres de l'app

### 2. Test Multi-Format iOS
1. Utilisez "🧪 Test iOS (natif, date, immédiat, répétition, simple)"
2. Vérifiez la console pour voir les logs
3. Attendez les notifications (30s, 60s, immédiat, 90s, 120s)

### 3. Vérifier les Permissions
- Allez dans **Réglages iPhone > Notifications > Expo Go**
- Assurez-vous que les notifications sont activées
- Vérifiez que "Autoriser les notifications" est activé

## 📋 Logs Attendus sur iOS

### Programmation Réussie
```javascript
📱 Plateforme détectée: ios
📱 Format de trigger pour ios: {"hour": 17, "minute": 22, "repeats": true}
✅ Notification quotidienne programmée avec ID: [ID] à 17:22
✅ Notification de demain programmée avec ID: [ID] pour ios
```

### Test Multi-Format
```javascript
🧪 Tentative de programmation avec différents formats de trigger...
📱 Plateforme détectée: ios
✅ TEST 1 programmé avec ID: [ID] (format: iOS natif)
✅ TEST 2 programmé avec ID: [ID] (format: date)
✅ TEST 3 programmé avec ID: [ID] (format: immédiat)
✅ TEST 4 programmé avec ID: [ID] (format: iOS répétition)
✅ TEST 5 programmé avec ID: [ID] (format: simple)
📋 Formats testés pour iOS: iOS natif, date, immédiat, iOS répétition, simple
```

## 🚨 Problèmes Courants iOS

### 1. Permissions Non Accordées
**Symptôme :** Aucune notification ne fonctionne
**Solution :** 
- Aller dans Réglages iPhone > Notifications > Expo Go
- Activer "Autoriser les notifications"

### 2. Mode Ne Pas Déranger
**Symptôme :** Notifications programmées mais pas de son
**Solution :**
- Vérifier que le mode Ne Pas Déranger est désactivé
- Ou autoriser Expo Go dans les exceptions

### 3. App en Arrière-Plan
**Symptôme :** Notifications programmées ne se déclenchent pas
**Solution :**
- Garder l'app Expo Go ouverte en arrière-plan
- Ou fermer et rouvrir l'app

### 4. Simulateur iOS
**Symptôme :** Pas de notifications sur simulateur
**Solution :**
- Utiliser un iPhone physique
- Les simulateurs ne supportent pas les notifications réelles

## 🔍 Diagnostic iOS

### Utiliser le Diagnostic Complet
1. Bouton "🔍 Diagnostic complet"
2. Vérifier les logs dans la console
3. Identifier les problèmes spécifiques

### Vérifications Manuelles
1. **Permissions** : Réglages > Notifications > Expo Go
2. **Mode Ne Pas Déranger** : Réglages > Ne Pas Déranger
3. **Focus** : Réglages > Focus (iOS 15+)
4. **Batterie** : Réglages > Batterie > Mode Économie

## 💡 Bonnes Pratiques iOS

### 1. Test sur Appareil Physique
- Les simulateurs iOS ne supportent pas les notifications
- Utilisez toujours un iPhone physique pour les tests

### 2. Permissions au Premier Lancement
- Demandez les permissions dès le premier lancement
- Expliquez pourquoi les notifications sont importantes

### 3. Format de Trigger iOS
- Utilisez `{ hour, minute, repeats }` pour iOS
- Évitez les calculs de `seconds` sur iOS

### 4. Test de Fonctionnement
- Testez avec des heures proches (dans 1-2 minutes)
- Vérifiez que les notifications arrivent bien

## 🎯 Résultat Attendu

Après ces modifications, sur un iPhone physique avec Expo Go :

1. ✅ **TEST 3 (immédiat)** : Devrait toujours fonctionner
2. ✅ **TEST 1 (iOS natif)** : Devrait fonctionner dans 30 secondes
3. ✅ **TEST 4 (iOS répétition)** : Devrait fonctionner dans 90 secondes
4. ✅ **Notifications quotidiennes** : Devraient se déclencher à l'heure prévue

## 🆘 Si Ça Ne Fonctionne Toujours Pas

1. **Vérifiez les permissions** dans Réglages iPhone
2. **Testez sur iPhone physique** (pas simulateur)
3. **Redémarrez Expo Go** et l'iPhone
4. **Utilisez le diagnostic complet** pour identifier le problème
5. **Vérifiez les logs** dans la console d'Expo
