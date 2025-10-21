# 🧪 Guide de Test des Fonctionnalités Premium

## 🎯 Objectifs des Tests

Vérifier que les fonctionnalités premium sont correctement intégrées et fonctionnelles avant publication.

## ✅ Checklist de Test

### 1. Interface Utilisateur

#### Bouton Panique (MainTab)
- [ ] Le bouton panique remplace l'ancien orb central
- [ ] Animation pulsante fonctionne correctement
- [ ] Couleur change selon le statut premium (orange pour gratuit, rouge pour premium)
- [ ] Texte change selon le statut premium
- [ ] Clic redirige vers l'onglet Premium si non-premium
- [ ] Clic affiche l'alerte "Mode Crise" si premium

#### Onglet Premium
- [ ] L'onglet Premium apparaît avant "Réglages" dans la navigation
- [ ] Icône étoile (⭐) s'affiche correctement
- [ ] Header avec titre "🚨 Besoin d'aide ?"
- [ ] Statut premium affiché (Version Gratuite / Premium Actif)
- [ ] Toutes les fonctionnalités premium listées
- [ ] Cards avec overlay "Bientôt" pour les utilisateurs non-premium
- [ ] Bouton d'achat visible pour les utilisateurs non-premium
- [ ] Bouton "Restaurer les achats" visible

#### Fonctionnalités Premium Preview
- [ ] 🚨 Bouton Panique - "Exercices de respiration et techniques de relaxation en cas de crise"
- [ ] 🫁 Exercices de Respiration - "Techniques guidées pour gérer le stress et l'anxiété"
- [ ] 🧘 Bibliothèque de Méditations - "Séances de méditation adaptées au sevrage tabagique"
- [ ] 🎵 Sons de Relaxation - "Bruits blancs, nature et ambiances apaisantes"
- [ ] 🤖 Chat IA Thérapeutique - "Assistant IA pour vous accompagner dans les moments difficiles"
- [ ] 💬 Support Prioritaire - "Accès prioritaire à notre équipe de support"

### 2. Navigation et Flux

#### Navigation
- [ ] Accueil | Profil | Analytics | Premium | Réglages
- [ ] Onglet Premium accessible depuis n'importe quel écran
- [ ] Bouton panique redirige vers Premium si non-premium
- [ ] Bouton panique fonctionne différemment si premium

#### Flux d'achat
- [ ] Clic sur fonctionnalité premium → Alerte avec option d'achat
- [ ] Clic sur "S'abonner" → Processus d'achat (en mode test)
- [ ] Clic sur "Restaurer les achats" → Fonction de restauration
- [ ] Messages d'erreur appropriés en cas d'échec

### 3. États et Persistance

#### État Premium
- [ ] `isPremium` initialisé à `false` par défaut
- [ ] État premium persiste entre les sessions (simulation)
- [ ] Interface s'adapte selon le statut premium
- [ ] Bouton panique change d'apparence selon le statut

#### Données de Souscription
- [ ] Contexte SubscriptionContext fonctionne
- [ ] Types TypeScript corrects
- [ ] Gestion des erreurs appropriée

## 🧪 Tests Spécifiques

### Test 1 : Utilisateur Non-Premium

1. **Lancer l'app**
   - Vérifier que `isPremium = false`
   - Bouton panique orange avec "Besoin d'aide ?"
   - Sous-texte "Premium"

2. **Cliquer sur le bouton panique**
   - Doit rediriger vers l'onglet Premium
   - Pas d'alerte "Mode Crise"

3. **Onglet Premium**
   - Statut "Version Gratuite"
   - Toutes les fonctionnalités avec overlay "Bientôt"
   - Bouton "S'abonner - 4.99€/mois" visible
   - Bouton "Restaurer les achats" visible

4. **Cliquer sur une fonctionnalité**
   - Alerte avec "Fonctionnalité Premium"
   - Options "Annuler" et "S'abonner"

### Test 2 : Utilisateur Premium (Simulation)

1. **Modifier temporairement le code**
   ```typescript
   // Dans SubscriptionContext.tsx, ligne ~25
   const [isPremium, setIsPremium] = useState(true); // Changé de false à true
   ```

2. **Relancer l'app**
   - Bouton panique rouge avec "Crise ?"
   - Sous-texte "Tapez ici"

3. **Cliquer sur le bouton panique**
   - Alerte "🚨 Mode Crise" avec message approprié

4. **Onglet Premium**
   - Statut "Premium Actif"
   - Fonctionnalités sans overlay
   - Pas de bouton d'achat

### Test 3 : Navigation

1. **Depuis l'Accueil**
   - Cliquer sur le bouton panique → Redirection Premium
   - Navigation manuelle vers Premium → Fonctionne

2. **Depuis les autres onglets**
   - Profil → Premium → Fonctionne
   - Analytics → Premium → Fonctionne
   - Réglages → Premium → Fonctionne

3. **Retour à l'Accueil**
   - Premium → Accueil → Bouton panique visible et fonctionnel

## 🔧 Tests Techniques

### 1. Performance
- [ ] Animation du bouton panique fluide (pas de lag)
- [ ] Changement d'onglet rapide
- [ ] Pas de fuite mémoire dans les animations

### 2. Compatibilité
- [ ] Fonctionne sur différentes tailles d'écran
- [ ] Responsive design correct
- [ ] Couleurs et contrastes appropriés

### 3. Gestion d'erreurs
- [ ] Erreurs de navigation gérées
- [ ] Erreurs d'achat gérées (messages appropriés)
- [ ] États de chargement gérés

## 📱 Tests sur Appareils

### Simulateur iOS
```bash
npx expo run:ios
```

### Appareil Android
```bash
npx expo run:android
```

### Web (pour test rapide)
```bash
npx expo start --web
```

## 🐛 Bugs Connus et Solutions

### Bug 1 : Animation ne se lance pas
**Solution :** Vérifier que `panicAnimation` est correctement initialisé

### Bug 2 : Navigation vers Premium ne fonctionne pas
**Solution :** Vérifier que l'onglet Premium est bien ajouté dans App.tsx

### Bug 3 : Styles du bouton panique incorrects
**Solution :** Vérifier que les nouveaux styles sont bien ajoutés dans MainTab.tsx

## 📊 Métriques de Succès

- [ ] 100% des fonctionnalités premium visibles
- [ ] Navigation fluide entre tous les onglets
- [ ] Bouton panique fonctionnel dans tous les cas
- [ ] Interface adaptative selon le statut premium
- [ ] Messages d'erreur clairs et utiles
- [ ] Performance optimale (pas de lag)

## 🚀 Prêt pour la Publication

Une fois tous les tests validés :

1. **Revertir le test premium** (remettre `isPremium` à `false`)
2. **Tester une dernière fois** en mode utilisateur normal
3. **Build de production** avec EAS
4. **Soumission à l'App Store**

## 💡 Notes Importantes

- Les fonctionnalités premium sont en "preview" - elles montrent ce qui sera disponible
- Le système d'achat est configuré mais nécessite la validation App Store Connect
- L'interface est prête pour l'ajout des vraies fonctionnalités premium
- Le design est cohérent avec l'identité visuelle de l'app
