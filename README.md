# 🌱 MyQuitZone - Votre compagnon pour arrêter de fumer

Une application mobile React Native (iOS + Android) moderne et motivante pour vous accompagner dans votre démarche d'arrêt du tabac.

## 🚀 Démarrage rapide

### Prérequis
- Node.js (version 18 ou plus récente)
- npm ou yarn
- Expo CLI : `npm install -g @expo/cli`
- Pour iOS : Xcode (macOS uniquement)
- Pour Android : Android Studio

### Installation
```bash
# Cloner le projet
git clone [url-du-repo]
cd MyQuitZone

# Installer les dépendances
npm install

# Lancer l'application
npx expo start
```

### Commandes disponibles
```bash
npm run android    # Lancer sur émulateur Android
npm run ios        # Lancer sur simulateur iOS (macOS uniquement)
npm run web        # Lancer sur navigateur web
npx expo start     # Lancer le serveur de développement
```

## 📱 Fonctionnalités

### 🏠 **Accueil (MainTab)**
- **Chronomètre temps réel** : Suivi du temps écoulé depuis votre dernier arrêt
- **Frise des 7 jours** : Visualisation de vos objectifs quotidiens avec statuts (✅/❌/⚪)
- **Boule colorée animée** : Indicateur visuel de votre progression (rouge → orange → vert)
- **Graine évolutive** : Transforme votre graine en arbre selon votre série (🌰 → 🌱 → 🌲 → 🌳)
- **Statistiques** : Cigarettes évitées, économies, jours de croissance
- **Boutons d'action** : Démarrer 🚀, Engagé ✅, Méditer 🧘, Redémarrer 🔁, Plus ⋯

### 👤 **Profil (ProfileTab)**
- **Configuration personnelle** : Années de tabagisme, cigarettes par jour
- **Objectifs** : Arrêt définitif ou progressif avec réduction personnalisée
- **Notifications** : Rappels quotidiens pour saisir votre consommation
- **Calcul des économies** : Projections financières (jour/mois/an)
- **Paramètres** : Prix par cigarette, animations, notifications

### 📊 **Analytics (AnalyticsTab)**
4 onglets d'analyse détaillée :

1. **🚬 Cigarettes** : Graphique linéaire théorique vs réel
2. **💰 Économies** : Suivi des économies cumulées
3. **🏥 Santé** : Bénéfices santé selon l'OMS avec progression
4. **🎯 Objectifs** : Gestion d'objectifs financiers personnalisés

### ⚙️ **Réglages (SettingsTab)**
- **Paramètres** : Prix par cigarette, devise, langue, animations
- **Gestion des données** : Export/Import JSON de toutes vos données
- **Zone de danger** : Reset complet si nécessaire
- **Support** : Contact, évaluation, guide d'utilisation

## 🎨 Design - Style Tech Futuriste

### Thème
- **Fond** : Ciel étoilé bleu profond animé avec dégradé
- **Style** : Tech futuriste gamifié avec glassmorphism et effets néon
- **Animations** : Transitions fluides, effets de glow, pulsations
- **Responsive** : Optimisé pour mobile iOS et Android

### Effets visuels
- **LinearGradient** : Dégradés bleu profond pour le fond
- **Glassmorphism** : Cartes avec effet de verre et blur
- **Cyber Glow** : Effets de lueur néon sur les éléments interactifs
- **Animations** : Float, pulse, glow pour les éléments avec react-native-reanimated

### Palette de couleurs
- **Primaire** : Bleu cyber (#3B82F6) avec glow
- **Secondaire** : Cyan électrique (#06B6D4) 
- **Succès** : Vert néon (#10B981)
- **Alerte** : Orange tech (#F59E0B)
- **Erreur** : Rouge alert (#EF4444)
- **Fond** : Dégradé bleu profond (#071033 → #0b2a59 → #020617)

## 💾 Stockage des données

L'application utilise AsyncStorage pour persister vos données :

- `@MyQuitZone:profile` : Profil utilisateur
- `@MyQuitZone:settings` : Paramètres de l'application
- `@MyQuitZone:session` : État du chronomètre
- `@MyQuitZone:dailyEntries` : Entrées quotidiennes
- `@MyQuitZone:streak` : Données de série
- `@MyQuitZone:goals` : Objectifs financiers
- `@MyQuitZone:achievements` : Réalisations débloquées

## 🔧 Configuration

### Variables personnalisables
Dans le code, vous pouvez modifier :

- **Prix par cigarette** : `settings.pricePerCig` (défaut: 0.60€)
- **Objectif par défaut** : `defaultGoalDays` (défaut: 60 jours)
- **Seuils de la graine** : `seedThresholds` (défaut: [0, 3, 10, 30])
- **Langue** : `language` (défaut: "fr")

### Bénéfices santé (source OMS)
Les bénéfices santé sont basés sur les données de l'Organisation Mondiale de la Santé :

- **20 min** : Pression sanguine et rythme cardiaque normalisés
- **12h** : Monoxyde de carbone normalisé
- **24h** : Circulation améliorée
- **48h** : Saveur et odorat améliorés
- **72h** : Respiration facilitée
- **14 jours** : Risque d'infection réduit
- **30 jours** : Risque de crise cardiaque réduit
- **1 an** : Risque de cancer du poumon réduit

## 🧪 Tests

### Checklist de validation
- [ ] Le chronomètre continue après fermeture/réouverture de l'app
- [ ] Les entrées quotidiennes mettent à jour la frise
- [ ] Les statistiques affichent les bonnes valeurs
- [ ] Les graphiques montrent les courbes théorique vs réel
- [ ] L'export JSON fonctionne correctement
- [ ] Les objectifs financiers calculent la progression
- [ ] Les animations sont fluides
- [ ] La navigation entre onglets fonctionne
- [ ] Le stockage persiste les données

### Tests sur simulateur/émulateur
```bash
# iOS Simulator (macOS uniquement)
npx expo run:ios

# Android Emulator
npx expo run:android

# Web (pour tests rapides)
npx expo start --web
```

## 📦 Scripts disponibles

```bash
npm run android          # Build et lance sur Android
npm run ios              # Build et lance sur iOS
npm run web              # Lance sur navigateur web
npx expo start           # Serveur de développement
npx expo build:android   # Build APK pour Android
npx expo build:ios       # Build pour iOS (nécessite compte Apple Developer)
```

## 🛠️ Technologies utilisées

- **React Native** avec TypeScript
- **Expo** pour le développement et le build
- **React Navigation** pour la navigation
- **AsyncStorage** pour le stockage local
- **React Native Chart Kit** pour les graphiques
- **React Native Reanimated** pour les animations
- **Expo Linear Gradient** pour les dégradés
- **Expo File System** pour l'export de données

## 📱 Déploiement

### Android
```bash
# Build APK
npx expo build:android

# Ou avec EAS Build (recommandé)
npx eas build --platform android
```

### iOS
```bash
# Build pour iOS (nécessite compte Apple Developer)
npx expo build:ios

# Ou avec EAS Build
npx eas build --platform ios
```

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur le repository
- Consulter la documentation Expo
- Vérifier les logs avec `npx expo start --clear`

---

**💪 Bon courage dans votre démarche d'arrêt du tabac ! Chaque jour compte.**

## 🔄 Migration depuis la version web

Si vous migrez depuis la version web de MyQuitZone :

1. **Exportez vos données** depuis la version web
2. **Importez-les** dans la version mobile via les paramètres
3. **Vérifiez** que toutes vos données sont correctement transférées
4. **Testez** toutes les fonctionnalités pour vous assurer du bon fonctionnement

La structure des données est compatible entre les deux versions.
