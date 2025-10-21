# 🔄 Guide des Modes de Développement

## 🎯 Problème
Les modules natifs comme `react-native-iap` ne fonctionnent pas dans Expo Go.

## 💡 Solutions

### **Mode 1 : Expo Go (Tests Rapides)**
Pour tester l'interface rapidement sans in-app purchases réels.

#### Configuration
1. **Modifier App.tsx** pour utiliser le mock :
```typescript
// Remplacer cette ligne :
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';

// Par cette ligne :
import { SubscriptionProviderMock as SubscriptionProvider } from './src/contexts/SubscriptionContextMock';
```

2. **Lancer avec Expo Go** :
```bash
npx expo start
```

#### Avantages
✅ Tests rapides de l'interface  
✅ Hot reload instantané  
✅ Pas de build nécessaire  
✅ Parfait pour le développement UI/UX  

#### Limitations
⚠️ Achats simulés uniquement  
⚠️ Pas de test des vrais in-app purchases  

### **Mode 2 : EAS Dev Build (Tests Complets)**
Pour tester les vraies in-app purchases.

#### Configuration
1. **Utiliser le vrai SubscriptionProvider** dans App.tsx
2. **Créer un dev build** :
```bash
eas build --profile development --platform ios
```

3. **Installer et lancer** :
```bash
npx expo start --dev-client
```

#### Avantages
✅ Vraies in-app purchases  
✅ Test complet du flux d'achat  
✅ Prêt pour la production  

#### Limitations
⚠️ Build de 5-10 minutes  
⚠️ Nécessite un compte Expo  

## 🔄 Basculement Rapide

### Script de Basculement
Créez `scripts/switch-dev-mode.js` :

```javascript
const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../App.tsx');
const content = fs.readFileSync(appTsxPath, 'utf8');

// Mode Expo Go (mock)
const mockImport = `import { SubscriptionProviderMock as SubscriptionProvider } from './src/contexts/SubscriptionContextMock';`;

// Mode Dev Build (vrai)
const realImport = `import { SubscriptionProvider } from './src/contexts/SubscriptionContext';`;

if (content.includes('SubscriptionProviderMock')) {
  console.log('🔄 Basculement vers le mode Dev Build...');
  const newContent = content.replace(mockImport, realImport);
  fs.writeFileSync(appTsxPath, newContent);
  console.log('✅ Mode Dev Build activé');
} else {
  console.log('🔄 Basculement vers le mode Expo Go...');
  const newContent = content.replace(realImport, mockImport);
  fs.writeFileSync(appTsxPath, newContent);
  console.log('✅ Mode Expo Go activé');
}
```

### Utilisation
```bash
node scripts/switch-dev-mode.js
```

## 📱 Workflow Recommandé

### Phase 1 : Développement UI/UX
1. **Mode Expo Go** avec mock
2. Développer et tester l'interface
3. Itérer rapidement sur le design

### Phase 2 : Tests Complets
1. **Mode Dev Build** avec vraies IAP
2. Tester le flux d'achat complet
3. Valider la logique métier

### Phase 3 : Production
1. Build de production avec EAS
2. Soumission à l'App Store

## 🧪 Tests par Mode

### Mode Expo Go
- [ ] Interface du bouton panique
- [ ] Navigation vers Premium
- [ ] Affichage des fonctionnalités
- [ ] Messages d'alerte
- [ ] Animation pulsante
- [ ] Achats simulés

### Mode Dev Build
- [ ] Vraies in-app purchases
- [ ] Validation des reçus
- [ ] Restauration des achats
- [ ] Gestion des erreurs
- [ ] Persistance des abonnements

## 💡 Conseils

1. **Commencez par Expo Go** pour l'interface
2. **Passez au Dev Build** pour les tests finaux
3. **Utilisez le script de basculement** pour gagner du temps
4. **Testez sur appareil réel** pour les IAP
5. **Gardez les deux versions** en parallèle

## 🚨 Important

- **Ne commitez jamais** les deux modes en même temps
- **Utilisez le mode mock** pour les démos
- **Utilisez le mode réel** pour les tests de production
- **Testez toujours** avant de publier
