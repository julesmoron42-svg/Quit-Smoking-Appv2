# Guide de Test - Données pour jules.moron@gmail.com

## 📋 Résumé
Ce guide vous permet de tester l'application avec des données réalistes pour l'utilisateur `jules.moron@gmail.com` sur 40 jours avec une progression de réduction de cigarettes et une streak maintenue.

## 🎯 Objectifs du Test
- ✅ Vérifier que la graine évolue correctement (🌰 → 🌱 → 🌲 → 🌳)
- ✅ Tester les graphiques avec des données réalistes
- ✅ Valider les calculs de statistiques
- ✅ Vérifier la cohérence des données

## 📊 Données Attendues
Avec les données de test, vous devriez voir :

### Statistiques Principales
- **Cigarettes évitées** : ~109 cigarettes
- **Argent économisé** : ~70.85€
- **Streak actuel** : 40 jours
- **État de la graine** : 🌳 (arbre complet)
- **Progression** : 67% vers l'arbre complet

### Progression par Semaine
- **Semaine 1** : 4/7 jours réussis (difficile au début)
- **Semaine 2** : 7/7 jours réussis (amélioration)
- **Semaine 3** : 5/7 jours réussis (légère régression)
- **Semaine 4** : 7/7 jours réussis (bonne progression)
- **Semaine 5** : 7/7 jours réussis (excellente progression)
- **Semaine 6** : 5/7 jours réussis (maintien)

## 🚀 Instructions d'Installation

### Étape 1 : Insérer les Données
1. Ouvrez votre projet Supabase
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `insert-test-data-jules.sql`
4. Vérifiez que toutes les tables ont été mises à jour

### Étape 2 : Vérifier les Données (Optionnel)
1. Exécutez le script `verify-test-data.sql` dans Supabase
2. Vérifiez que toutes les sections montrent des données cohérentes

### Étape 3 : Tester l'Application
1. Lancez votre application
2. Connectez-vous avec l'email `jules.moron@gmail.com`
3. Vérifiez que vous voyez l'écran principal avec les données

## 🔍 Points de Vérification

### Écran Principal (MainTab)
- [ ] La graine affiche 🌳 (arbre complet)
- [ ] Le streak affiche "40 jours"
- [ ] Les statistiques montrent ~109 cigarettes évitées
- [ ] Les économies montrent ~70.85€
- [ ] La frise des 7 jours montre des données cohérentes

### Onglet Analytics - Cigarettes
- [ ] Le graphique affiche une ligne théorique (pointillée bleue)
- [ ] Le graphique affiche une ligne réelle (verte)
- [ ] La progression montre une réduction progressive
- [ ] Les labels de dates sont corrects

### Onglet Analytics - Économies
- [ ] Le graphique cumulatif monte progressivement
- [ ] Le total des économies correspond aux calculs
- [ ] La légende est correcte

### Onglet Analytics - Santé
- [ ] Plusieurs bénéfices santé sont débloqués
- [ ] Les barres de progression sont correctes
- [ ] Les temps restants sont calculés correctement

### Onglet Analytics - Objectifs
- [ ] Les objectifs financiers sont affichés
- [ ] Les progressions sont calculées correctement
- [ ] Le total économisé correspond

## 🐛 Dépannage

### Problème : La graine ne s'affiche pas correctement
**Solution** : Vérifiez que le streak dans la base de données est bien à 40 jours

### Problème : Les graphiques sont vides
**Solution** : Vérifiez que les entrées quotidiennes ont été insérées correctement

### Problème : Les statistiques sont incorrectes
**Solution** : Vérifiez que le profil utilisateur a les bonnes valeurs (cigsPerDay: 20)

### Problème : L'utilisateur ne se connecte pas
**Solution** : Vérifiez que l'email `jules.moron@gmail.com` existe dans la table `user_profiles`

## 📈 Évolution de la Graine

La graine évolue selon cette logique :
- **🌰 Graine** : 0-9 jours
- **🌱 Pousse** : 10-29 jours  
- **🌲 Petit arbre** : 30-49 jours
- **🌳 Arbre complet** : 50+ jours

Avec 40 jours de streak, l'utilisateur devrait voir un **🌲 Petit arbre**.

## 🎨 Personnalisation

Si vous voulez modifier les données :
1. Modifiez les valeurs dans `insert-test-data-jules.sql`
2. Ajustez la progression dans la boucle `DO $$`
3. Changez les émotions et objectifs selon vos besoins

## 📝 Notes Techniques

- Les données couvrent 40 jours consécutifs
- La progression suit une réduction d'1 cigarette par semaine
- Les émotions sont choisies selon la performance
- Le streak est maintenu sur toute la période
- Les objectifs financiers et réalisations sont inclus

## ✅ Validation Finale

Après avoir suivi ce guide, vous devriez avoir :
- [ ] Une application fonctionnelle avec des données réalistes
- [ ] Des graphiques qui s'affichent correctement
- [ ] Une graine qui évolue selon la progression
- [ ] Des statistiques cohérentes et motivantes

---

*Ce guide a été créé pour tester l'application avec des données réalistes et vérifier que tous les composants fonctionnent correctement.*
