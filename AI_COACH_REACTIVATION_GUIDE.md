# 🔄 Réactivation du Coach IA - Guide pour demain

## 📋 État actuel

Le coach IA est temporairement désactivé avec le message "Bientôt disponible" en attendant la configuration de l'API Gemini.

## 🔧 Pour réactiver demain

### 1. Après avoir ajouté votre carte bancaire sur Google AI Studio

#### Étape 1 : Tester l'API
```typescript
// Testez d'abord avec ce script simple
const testAPI = async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${AI_COACH_CONFIG.GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Bonjour' }] }]
    })
  });
  
  console.log('Status:', response.status);
  return response.ok;
};
```

#### Étape 2 : Réactiver dans MainTab.tsx
Remplacez le code temporaire par le code original :

```typescript
const handleAITherapistButton = async () => {
  await HapticService.selection();
  
  if (!isPremium) {
    Alert.alert(
      '🤖 Coach IA',
      'Cette fonctionnalité est disponible avec l\'abonnement Premium. Voulez-vous vous abonner ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Voir les offres', onPress: () => navigation.navigate('Premium') }
      ]
    );
    return;
  }
  
  setShowAICoach(true);
};
```

#### Étape 3 : Réactiver dans PremiumTab.tsx
Remplacez le message "Bientôt disponible" par :

```typescript
onPress={() => handleFeaturePress({ id: 'ai_coach', title: 'Coach IA', isAvailable: true })}
```

### 2. Configuration finale

#### Vérifiez la configuration dans `aiCoachConfig.ts` :
```typescript
export const AI_COACH_CONFIG = {
  GEMINI_API_KEY: 'AIzaSyCoPHqjxwDN5tLefiKOfh3puwcv11-T1C4',
  MODEL: 'gemini-1.0-pro',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=',
};
```

#### Testez le coach IA :
1. Ouvrez l'écran principal
2. Cliquez sur "🤖 Coach IA"
3. L'interface devrait s'ouvrir en plein écran avec fond noir
4. Envoyez un message de test

## 🧪 Tests à effectuer

### 1. Test de l'API
- ✅ Réponse HTTP 200
- ✅ Message reçu du coach IA
- ✅ Pas d'erreur 404

### 2. Test de l'interface
- ✅ Interface plein écran
- ✅ Fond noir cohérent
- ✅ Messages utilisateur/coach différenciés
- ✅ Suggestions de messages
- ✅ Sauvegarde des conversations

### 3. Test des fonctionnalités
- ✅ Réponses personnalisées
- ✅ Contexte utilisateur chargé
- ✅ Historique des conversations
- ✅ Bouton effacer conversation

## 📁 Fichiers à modifier pour réactivation

### 1. `src/screens/MainTab.tsx`
- Décommenter le code original dans `handleAITherapistButton`
- Supprimer le message "Bientôt disponible"

### 2. `src/screens/PremiumTab.tsx`
- Remplacer l'alert par `handleFeaturePress`
- Supprimer le message "Bientôt disponible"

### 3. `src/config/aiCoachConfig.ts`
- Vérifier que la clé API est correcte
- Vérifier que le modèle est `gemini-1.0-pro`

## 🚀 Une fois réactivé

### Fonctionnalités disponibles :
- ✅ **Interface plein écran** avec fond noir
- ✅ **Réponses personnalisées** basées sur le profil utilisateur
- ✅ **Sauvegarde automatique** des conversations dans Supabase
- ✅ **Suggestions de messages** contextuelles
- ✅ **Animation de frappe** pendant la génération
- ✅ **Historique des conversations** chargé au démarrage

### Configuration finale :
- ✅ **Mode premium activé** pour les tests
- ✅ **Tables Supabase créées** pour stocker les conversations
- ✅ **Logs nettoyés** pour un débogage propre
- ✅ **Interface optimisée** pour l'expérience utilisateur

## 📞 Support

Si vous rencontrez des problèmes lors de la réactivation :
1. Vérifiez que votre carte bancaire est bien ajoutée
2. Testez l'API avec le script de test
3. Vérifiez les logs dans la console
4. Contactez le support Google AI si nécessaire

**Le coach IA sera prêt à être réactivé dès que l'API Gemini fonctionnera !** 🚀
