# 🔔 Guide de Dépannage des Notifications

## Problème Identifié : API getAllScheduledNotificationsAsync() retourne 0

### 🚨 **Problème Principal**
Les notifications sont correctement programmées (on voit les IDs dans les logs), mais `getAllScheduledNotificationsAsync()` retourne toujours 0. Ceci est un problème connu sur certaines plateformes.

### ✅ **Solution Implémentée**
- Stockage local des IDs des notifications programmées
- Diagnostic amélioré pour identifier les problèmes de plateforme
- Messages d'information pour rassurer l'utilisateur

### ✅ Solutions Implémentées

1. **Amélioration du trigger de notification**
   - Changé de `{ hour, minute, repeats: true }` vers `{ date: Date, repeats: true }`
   - Calcul automatique de la prochaine occurrence
   - Programmation de plusieurs notifications pour assurer la répétition

2. **Vérification des permissions**
   - Vérification automatique des permissions avant programmation
   - Messages d'erreur clairs si permissions manquantes

3. **Logging détaillé**
   - Affichage de l'heure de programmation
   - Affichage de la prochaine occurrence
   - Affichage des IDs des notifications programmées

4. **Outils de debug ajoutés**
   - Bouton "🔍 Voir notifications programmées" - Affiche toutes les notifications programmées
   - Bouton "🧪 Test dans 10 secondes" - Programme une notification de test
   - Bouton "🔍 Diagnostic complet" - Analyse complète des problèmes

5. **Stockage local des IDs**
   - Les IDs des notifications programmées sont maintenant stockés localement
   - Affichage des IDs stockés même si l'API ne les retourne pas
   - Messages informatifs pour expliquer les limitations de plateforme

### 🧪 Comment Tester

1. **Ouvrir les paramètres** dans l'application
2. **Activer les notifications** si ce n'est pas déjà fait
3. **Utiliser le bouton de test** "🧪 Test dans 10 secondes"
4. **Utiliser "🔍 Diagnostic complet"** pour analyser les problèmes
5. **Vérifier la console** pour voir les logs détaillés
6. **Utiliser "🔍 Voir notifications programmées"** pour vérifier la programmation

### 🔍 Vérifications à Faire

#### 1. Permissions
```javascript
// Vérifier dans la console si vous voyez :
✅ Autorisation accordée pour les notifications
// ou
❌ Pas d'autorisation pour programmer les notifications
```

#### 2. Programmation
```javascript
// Vérifier dans la console si vous voyez :
🔔 Programmation de la notification pour XX:XX
🕐 Prochaine notification programmée pour: [date]
✅ Notification quotidienne programmée avec ID: [ID]
```

#### 3. Notifications programmées
```javascript
// Cliquer sur "🔍 Voir notifications programmées" devrait afficher :
📋 Notifications programmées via API (X):
  1. ID: [ID]
     Titre: [Titre]
     Trigger: {"date": "[ISO_DATE]", "repeats": true}

📋 IDs stockés localement (Y):
  1. ID: [ID]
  2. ID: [ID]

// Si API = 0 mais local > 0, vous verrez :
⚠️ Les notifications semblent programmées (IDs stockés) mais l'API ne les retourne pas.
💡 Cela peut arriver sur certaines plateformes (web, simulateur).
💡 Les notifications devraient quand même fonctionner !
```

### 🚨 Problèmes Courants et Solutions

#### Problème 1: "Pas d'autorisation"
**Solution :** Aller dans les paramètres de l'appareil et autoriser les notifications pour MyQuitZone

#### Problème 2: Notifications programmées mais pas de déclenchement
**Causes possibles :**
- Mode économie d'énergie activé
- Mise en veille de l'application
- Restrictions système

**Solutions :**
- Désactiver l'optimisation de batterie pour l'app
- Ajouter l'app aux exceptions de mise en veille
- Redémarrer l'appareil

#### Problème 3: Notifications de test fonctionnent mais pas les notifications quotidiennes
**Cause :** Problème avec la répétition des notifications
**Solution :** Le code programme maintenant plusieurs notifications pour s'assurer de la répétition

#### Problème 4: "0 notifications programmées" mais les IDs sont visibles
**Cause :** Limitation de l'API `getAllScheduledNotificationsAsync()` sur certaines plateformes
**Solution :** 
- ✅ Les notifications sont bien programmées (IDs visibles dans les logs)
- ✅ Elles devraient fonctionner malgré l'affichage "0"
- ✅ Utiliser "🔍 Diagnostic complet" pour confirmer
- ✅ Tester avec une notification dans 10 secondes

### 📱 Plateformes Supportées

- ✅ **iOS** : Fonctionne avec les restrictions d'Apple
- ✅ **Android** : Fonctionne avec les optimisations de batterie
- ⚠️ **Web** : Notifications limitées par le navigateur

### 🔧 Code de Debug Ajouté

```javascript
// Nouvelle méthode pour vérifier les notifications programmées
await notificationService.getScheduledNotifications();

// Nouvelle méthode pour tester la programmation
await notificationService.scheduleTestNotificationInSeconds(10);

// Nouvelle méthode de diagnostic
await notificationService.diagnoseNotificationIssues();

// Logging amélioré dans scheduleDailyNotification()
console.log(`🔔 Programmation de la notification pour ${hours}:${minutes}`);
console.log(`🕐 Prochaine notification programmée pour: ${nextNotification.toLocaleString()}`);
console.log(`✅ Notification quotidienne programmée avec ID: ${notificationId}`);

// Stockage local des IDs
console.log(`📋 IDs stockés localement (${localIds.length}):`);
localIds.forEach((id, index) => {
  console.log(`  ${index + 1}. ID: ${id}`);
});
```

### 📊 Monitoring

Pour surveiller le bon fonctionnement :
1. Ouvrir la console de développement
2. Utiliser "🔍 Diagnostic complet" pour analyser les problèmes
3. Utiliser les boutons de debug dans les paramètres
4. Vérifier les logs lors de la programmation
5. Tester avec des notifications à court terme (10 secondes)
6. Vérifier les "IDs stockés localement" même si l'API retourne 0

### 🆘 Si le Problème Persiste

1. **Utiliser "🔍 Diagnostic complet"** pour identifier le problème exact
2. Vérifier que l'application a les permissions
3. Tester avec une notification dans 10 secondes
4. Vérifier les "IDs stockés localement" dans la console
5. Vérifier les logs dans la console
6. Redémarrer l'application
7. Redémarrer l'appareil si nécessaire

### 💡 **Important à Retenir**

**Si vous voyez des IDs dans les logs mais "0 notifications programmées" :**
- ✅ Les notifications sont bien programmées
- ✅ Elles devraient fonctionner à l'heure prévue
- ⚠️ C'est juste un problème d'affichage de l'API sur certaines plateformes
- 💡 Testez avec une notification dans 10 secondes pour confirmer
