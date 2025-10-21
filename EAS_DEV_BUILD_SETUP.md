# 🚀 Configuration EAS Dev Build pour In-App Purchases

## Problème
Les modules natifs comme `react-native-iap` ne fonctionnent pas dans Expo Go. Il faut utiliser un dev build.

## Solution : EAS Dev Build

### 1. Installer EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Configurer EAS
```bash
eas login
eas build:configure
```

### 3. Modifier eas.json
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "bundleIdentifier": "com.myquitzone.dev"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "bundleIdentifier": "com.myquitzone.preview"
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.myquitzone.app"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 4. Créer le Dev Build
```bash
# Pour iOS Simulator
eas build --profile development --platform ios

# Pour appareil iOS physique
eas build --profile development --platform ios --device

# Pour Android
eas build --profile development --platform android
```

### 5. Installer le Dev Build
- Téléchargez le build depuis EAS
- Installez-le sur votre appareil/simulateur
- Utilisez `npx expo start --dev-client` au lieu de `npx expo start`

## Avantages
✅ Support des modules natifs  
✅ In-app purchases fonctionnels  
✅ Hot reload conservé  
✅ Même workflow de développement  

## Inconvénients
⚠️ Build plus long (5-10 minutes)  
⚠️ Nécessite un compte Expo  
⚠️ Plus complexe que Expo Go  

## Alternative : Mode Bare Workflow
Si vous préférez, vous pouvez éjecter vers le bare workflow :

```bash
npx expo eject
```

Mais cela perd les avantages d'Expo (hot reload, over-the-air updates, etc.).
