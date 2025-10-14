# 🔔 Guide des Notifications - MyQuitSpace

## Fonctionnalités ajoutées

### 1. Demande d'autorisation automatique
- **Quand** : Lors de la première connexion de l'utilisateur
- **Comportement** : L'app demande automatiquement l'autorisation pour les notifications après 2 secondes de connexion
- **Gestion intelligente** : Ne redemande pas l'autorisation si elle a été demandée dans les 7 derniers jours

### 2. Service de notifications complet
- **Notifications quotidiennes** : Rappel à 20h00 par défaut pour saisir les données du jour
- **Messages personnalisés** : "Il est temps de saisir vos données du jour ! Comment s'est passée votre journée sans fumer ?"
- **Gestion des permissions** : Vérification et demande d'autorisation automatique
- **Persistance** : Les paramètres sont sauvegardés dans AsyncStorage

### 3. Bouton de test de notification
- **Localisation** : Dans l'écran principal (MainTab)
- **Fonction** : Envoie une notification de test immédiate
- **Feedback** : Affiche une alerte de confirmation après envoi
- **Messages** : Utilise les mêmes messages aléatoires que les notifications quotidiennes

### 4. Configuration dans les paramètres
- **Activation/Désactivation** : Switch pour contrôler les notifications
- **Affichage de l'heure** : Montre l'heure configurée pour le rappel quotidien (20:00)
- **Bouton de test** : Permet de tester les notifications depuis les paramètres
- **Gestion d'erreurs** : Messages d'erreur clairs en cas de problème

### 5. Interaction avec les notifications
- **Clic sur notification** : Ouvre automatiquement l'overlay de saisie quotidienne
- **Deep linking** : Navigation intelligente vers la fonctionnalité appropriée
- **Expérience fluide** : L'utilisateur est directement amené à saisir ses données du jour

## Utilisation

### Pour l'utilisateur
1. **Première connexion** : L'app demande automatiquement l'autorisation
2. **Tester** : Utiliser le bouton "🔔 Tester la notification" dans l'écran principal
3. **Configurer** : Aller dans Paramètres > Notifications pour activer/désactiver
4. **Vérifier** : Les notifications quotidiennes arrivent à 20h00
5. **Interagir** : Cliquer sur une notification ouvre directement l'overlay de saisie quotidienne

### Pour le développeur
```typescript
// Importer le service
import { notificationService } from '../lib/notificationService';

// Demander l'autorisation
const granted = await notificationService.requestPermission();

// Envoyer une notification de test
await notificationService.sendTestNotification();

// Programmer les notifications quotidiennes
await notificationService.scheduleDailyNotification();

// Vérifier les permissions
const hasPermission = await notificationService.checkPermission();
```

## Structure des fichiers

### Nouveaux fichiers
- `src/lib/notificationService.ts` - Service principal de gestion des notifications

### Fichiers modifiés
- `src/contexts/AuthContext.tsx` - Intégration de la demande d'autorisation
- `src/screens/MainTab.tsx` - Ajout du bouton de test
- `src/screens/SettingsTab.tsx` - Configuration des notifications

## Messages de notification

### Notification quotidienne (Messages aléatoires)
L'app choisit aléatoirement parmi 3 messages motivants :

1. **Message 1** :
   - **Titre** : "🎯 Mission quotidienne accomplie ?"
   - **Message** : "Alors, as-tu réussi ta mission du jour ? Viens me raconter tes victoires, même les petites ! 🏆"

2. **Message 2** :
   - **Titre** : "⚡ Défi quotidien relevé ?"
   - **Message** : "Alors champion, as-tu relevé le défi du jour ? Raconte-moi tes exploits ! 💪"

3. **Message 3** :
   - **Titre** : "🌟 Succès du jour à partager ?"
   - **Message** : "Champion, quels sont tes succès d'aujourd'hui ? Même les plus petits comptent énormément ! 🏅"

### Notification de test (Mêmes messages que quotidiens)
La notification de test utilise exactement les mêmes messages aléatoires que les notifications quotidiennes, permettant aux utilisateurs de voir directement ce qu'ils recevront :

- **Même pool de messages** : Utilise les 3 messages de la section "Notification quotidienne"
- **Expérience réaliste** : L'utilisateur voit exactement le type de message qu'il recevra
- **Test authentique** : Pas de message "test" artificiel, mais les vrais messages motivants

## Configuration technique

### Permissions requises
- `expo-notifications` - Déjà inclus dans package.json
- Autorisation système pour les notifications

### Paramètres sauvegardés
- `notification_settings` dans AsyncStorage
- État d'activation des notifications
- Heure du rappel quotidien
- Date de la dernière demande d'autorisation

### Gestion d'erreurs
- Vérification des permissions avant envoi
- Messages d'erreur explicites
- Fallback gracieux si les notifications sont désactivées

## Améliorations futures possibles

1. **Sélecteur d'heure** : Interface pour choisir l'heure du rappel
2. **Notifications multiples** : Rappels matinaux et soir
3. **Personnalisation** : Messages personnalisés par l'utilisateur
4. **Statistiques** : Suivi de l'engagement avec les notifications
5. **Notifications intelligentes** : Basées sur les habitudes de l'utilisateur
