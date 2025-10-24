# 🎵 Guide d'Intégration des Sons MyQuitSpace

## ✅ **Ce qui est déjà fait :**

1. **Structure des dossiers créée** : `assets/sounds/` avec sous-dossiers par catégorie
2. **Composant SoundsLibrary** : Interface complète avec contrôles de lecture
3. **Intégration dans l'onglet Premium** : Le bouton "Sons" ouvre maintenant la bibliothèque
4. **Configuration centralisée** : Tous les sons sont définis dans `src/config/soundsConfig.ts`

## 📁 **Structure des dossiers :**

```
assets/sounds/
├── breathing/          ← Sons de respiration
│   ├── white-noise-calm.mp3
│   └── pink-noise-calm.mp3
├── nature/            ← Sons de la nature
│   ├── ocean-waves-slow.mp3
│   ├── gentle-rain-ambience.mp3
│   └── forest-morning-ambience.mp3
├── meditation/        ← Sons de méditation
│   ├── tibetan-bowl-meditation.mp3
│   └── calm-piano-loop.mp3
├── frequencies/       ← Fréquences sonores
│   ├── alpha-waves-focus.mp3
│   └── theta-binaural-calm.mp3
└── mixed/            ← Mix et combinaisons
    └── calm-deep-meditation-mix.mp3
```

## 🚀 **Comment ajouter vos fichiers audio :**

### **Étape 1 : Placez vos fichiers**
1. Téléchargez vos fichiers MP3 depuis Pixabay (ou autres sources)
2. Renommez-les exactement comme indiqué dans la liste ci-dessus
3. Placez-les dans le bon dossier selon leur catégorie

### **Étape 2 : Activez la lecture audio**
1. Ouvrez le fichier `src/config/soundsConfig.ts`
2. Décommentez la ligne 11 :
   ```typescript
   // AVANT (ligne commentée) :
   // return require(`../../assets/sounds/${category}/${filename}`);
   
   // APRÈS (décommentez) :
   return require(`../../assets/sounds/${category}/${filename}`);
   ```

### **Étape 3 : Testez l'application**
1. Lancez l'app avec `npm start`
2. Allez dans l'onglet "Premium"
3. Cliquez sur le bouton "🔊 Sons"
4. Sélectionnez un son et testez la lecture

## 🎯 **Fonctionnalités disponibles :**

### **Interface utilisateur :**
- ✅ Filtrage par catégories (Respiration, Nature, Méditation, etc.)
- ✅ Liste des sons avec descriptions et conseils d'usage
- ✅ Lecteur audio intégré avec contrôles complets

### **Contrôles de lecture :**
- ✅ Play/Pause
- ✅ Stop
- ✅ Contrôle du volume (+/-)
- ✅ Barre de progression
- ✅ Affichage du temps (actuel/total)

### **Organisation :**
- ✅ 10 sons organisés par catégories
- ✅ Descriptions détaillées pour chaque son
- ✅ Conseils d'utilisation spécifiques
- ✅ Durées et usages recommandés

## 🔧 **Configuration technique :**

### **Formats supportés :**
- **MP3** (recommandé) : Meilleur compromis taille/qualité
- **WAV** : Qualité maximale, fichiers plus lourds
- **M4A** : Qualité excellente, bon pour la compression

### **Tailles recommandées :**
- **Sons courts** (< 5 min) : 1-3 MB
- **Ambiances longues** (5-10 min) : 3-8 MB
- **Qualité audio** : 128-192 kbps pour de bonnes performances

## 🎨 **Personnalisation :**

### **Ajouter un nouveau son :**
1. Ajoutez le fichier dans le bon dossier
2. Modifiez `src/config/soundsConfig.ts`
3. Ajoutez un nouvel objet dans le tableau `soundsLibrary`

### **Modifier les catégories :**
1. Éditez `categoryInfo` dans `soundsConfig.ts`
2. Ajoutez/modifiez les couleurs et emojis

## 🐛 **Dépannage :**

### **Le son ne se charge pas :**
- Vérifiez que le fichier existe dans le bon dossier
- Vérifiez le nom du fichier (doit correspondre exactement)
- Vérifiez que la ligne `require()` est décommentée

### **Erreur de lecture :**
- Vérifiez le format du fichier (MP3 recommandé)
- Vérifiez la taille du fichier (< 10MB)
- Vérifiez que le fichier n'est pas corrompu

### **Performance lente :**
- Réduisez la qualité audio (128 kbps)
- Réduisez la taille des fichiers
- Utilisez le format MP3

## 📱 **Test sur différents appareils :**

### **iOS :**
- Testez avec des casques
- Vérifiez la compatibilité avec le mode silencieux

### **Android :**
- Testez avec différents navigateurs
- Vérifiez les autorisations audio

## 🎵 **Sons déjà configurés :**

1. **🌬️ Bruit blanc doux** - Calme immédiat (5 min)
2. **🌸 Bruit rose** - Respiration profonde (10 min)
3. **🌊 Vagues lentes** - Ancrage océanique (7 min)
4. **🌧️ Pluie légère** - Purification mentale (10 min)
5. **🍃 Forêt & oiseaux** - Retour à la nature (6 min)
6. **🕯️ Bol tibétain** - Reset mental (8 min)
7. **🪶 Piano lent** - Clarté intérieure (5 min)
8. **🧠 Fréquences Alpha** - Contrôle et détente (10 min)
9. **🌑 Fréquences Theta** - Lâcher prise total (10 min)
10. **🔔 Mix sensoriel** - Craving Reset (3 min)

---

**🎯 Prochaine étape :** Placez vos fichiers audio dans les dossiers et décommentez la ligne dans `soundsConfig.ts` pour activer la lecture !


