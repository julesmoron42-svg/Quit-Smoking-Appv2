# 🛒 Configuration des In-App Purchases

## 📱 Configuration iOS (App Store Connect)

### 1. Créer un produit In-App Purchase

1. **Connectez-vous à App Store Connect**
   - Allez sur [App Store Connect](https://appstoreconnect.apple.com)
   - Sélectionnez votre app "MyQuitZone"

2. **Créer un abonnement automatique renouvelable**
   - Allez dans "Fonctionnalités" > "Abonnements automatiques renouvelables"
   - Cliquez sur "+" pour créer un nouveau groupe d'abonnements
   - Nom du groupe : "Premium Subscription"

3. **Configurer l'abonnement Premium**
   - Nom de référence : "Premium Monthly"
   - ID du produit : `com.myquitzone.premium.monthly`
   - Durée : 1 mois
   - Prix : 4.99€ (ou selon votre stratégie)
   - Nom affiché : "Premium Mensuel"
   - Description : "Accès à toutes les fonctionnalités premium"

4. **Métadonnées requises**
   - Nom d'affichage : "Premium Mensuel"
   - Description : "Débloquez des outils puissants pour vous accompagner dans votre sevrage tabagique"
   - URL de révision : (optionnel)

### 2. Configuration du produit

```typescript
// Dans votre code, l'ID du produit est :
const productId = 'com.myquitzone.premium.monthly';
```

### 3. Test des achats

1. **Utilisateurs de test**
   - Créez des comptes de test dans App Store Connect
   - Utilisez ces comptes sur votre appareil de test

2. **Mode Sandbox**
   - Les achats en mode sandbox ne sont pas facturés
   - Parfait pour tester l'intégration

## 🔧 Configuration du Code

### 1. Permissions iOS

Ajoutez dans `ios/MyQuitZone/Info.plist` :

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Cette application utilise le suivi pour personnaliser votre expérience premium.</string>
```

### 2. Configuration EAS Build

Dans `eas.json`, ajoutez les capacités iOS :

```json
{
  "build": {
    "production": {
      "ios": {
        "bundleIdentifier": "com.myquitzone.app",
        "capabilities": {
          "inAppPurchase": true
        }
      }
    }
  }
}
```

### 3. Variables d'environnement

Créez un fichier `.env` :

```env
# In-App Purchases
IAP_PRODUCT_ID_PREMIUM_MONTHLY=com.myquitzone.premium.monthly
```

## 🧪 Test des Achats

### 1. Test sur simulateur iOS

```bash
# Lancer sur simulateur iOS
npx expo run:ios

# Tester l'achat avec un compte sandbox
```

### 2. Test sur appareil physique

1. Connectez-vous avec un compte de test sandbox
2. Allez dans Réglages > App Store > Compte de test
3. Utilisez les identifiants de test

### 3. Vérification des achats

```typescript
// Le contexte SubscriptionContext gère automatiquement :
// - La validation des achats
// - La restauration des achats
// - Le statut premium
```

## 🚀 Déploiement

### 1. Build de production

```bash
# Build iOS
eas build --platform ios --profile production

# Soumission à l'App Store
eas submit --platform ios
```

### 2. Vérifications avant soumission

- [ ] Produit in-app configuré dans App Store Connect
- [ ] Test des achats en mode sandbox
- [ ] Validation des reçus
- [ ] Restauration des achats
- [ ] Gestion des erreurs

## 🔍 Dépannage

### Problèmes courants

1. **Erreur "Product not available"**
   - Vérifiez l'ID du produit
   - Assurez-vous que le produit est approuvé dans App Store Connect

2. **Achats non restaurés**
   - Vérifiez que l'utilisateur est connecté au bon compte
   - Testez avec un compte de test sandbox

3. **Erreur de validation**
   - Vérifiez la configuration des reçus
   - Assurez-vous que le produit est actif

### Logs utiles

```typescript
// Activer les logs détaillés
console.log('Purchase updated:', purchase);
console.log('Available products:', products);
console.log('Subscription status:', isPremium);
```

## 📋 Checklist de Validation

- [ ] Produit créé dans App Store Connect
- [ ] ID du produit correspond au code
- [ ] Test des achats en sandbox
- [ ] Validation des reçus
- [ ] Restauration des achats
- [ ] Gestion des erreurs
- [ ] Interface utilisateur responsive
- [ ] Messages d'erreur appropriés

## 💡 Conseils

1. **Testez régulièrement** avec des comptes de test
2. **Validez les reçus** côté serveur pour la sécurité
3. **Gérez les cas d'erreur** avec des messages clairs
4. **Sauvegardez l'état** des abonnements localement
5. **Restaurez les achats** à chaque lancement de l'app
