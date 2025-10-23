// Configuration des sons MyQuitSpace
// Ce fichier vous permet de facilement ajouter vos vrais fichiers audio

export interface SoundTrack {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  emoji: string;
  filename: string;
  usage: string;
  tip: string;
  // Chemin vers le fichier audio (sera configuré automatiquement)
  audioPath?: any;
}

// Import statique de tous les fichiers audio
const audioFiles = {
  // Sons de respiration
  'breathing/white-noise-calm.mp3': require('../../assets/sounds/breathing/white-noise-calm.mp3'),
  'breathing/pink-noise-calm.mp3': require('../../assets/sounds/breathing/pink-noise-calm.mp3'),
  'breathing/pink-noise-asmr.mp3': require('../../assets/sounds/breathing/pink-noise-asmr.mp3'),
  
  // Sons de nature
  'nature/ocean-waves-slow.mp3': require('../../assets/sounds/nature/ocean-waves-slow.mp3'),
  'nature/gentle-rain-ambience.mp3': require('../../assets/sounds/nature/gentle-rain-ambience.mp3'),
  'nature/forest-morning-ambience.mp3': require('../../assets/sounds/nature/forest-morning-ambience.mp3'),
  'nature/forest-atmosphere.mp3': require('../../assets/sounds/nature/forest-atmosphere.mp3'),
  'nature/rain-whisper-calm.mp3': require('../../assets/sounds/nature/rain-whisper-calm.mp3'),
  
  // Sons de méditation
  'meditation/tibetan-bowl-meditation.mp3': require('../../assets/sounds/meditation/tibetan-bowl-meditation.mp3'),
  'meditation/tibetan-bowl-healing.mp3': require('../../assets/sounds/meditation/tibetan-bowl-healing.mp3'),
  'meditation/calm-piano-loop.mp3': require('../../assets/sounds/meditation/calm-piano-loop.mp3'),
  'meditation/calm-meditation.mp3': require('../../assets/sounds/meditation/calm-meditation.mp3'),
  'meditation/relaxation-meditation.mp3': require('../../assets/sounds/meditation/relaxation-meditation.mp3'),
  
  // Fréquences
  'frequencies/alpha-waves-focus.mp3': require('../../assets/sounds/frequencies/alpha-waves-focus.mp3'),
  'frequencies/theta-binaural-calm.mp3': require('../../assets/sounds/frequencies/theta-binaural-calm.mp3'),
  'frequencies/meditation-binaural-10hz.mp3': require('../../assets/sounds/frequencies/meditation-binaural-10hz.mp3'),
  
  // Mix
  'mixed/calm-deep-meditation-mix.mp3': require('../../assets/sounds/mixed/calm-deep-meditation-mix.mp3'),
  'mixed/gentle-rain-mix.mp3': require('../../assets/sounds/mixed/gentle-rain-mix.mp3'),
};

// Fonction pour obtenir le chemin vers les fichiers audio
const getAudioPath = (category: string, filename: string) => {
  const key = `${category}/${filename}`;
  return audioFiles[key as keyof typeof audioFiles];
};

export const soundsLibrary: SoundTrack[] = [
  // Sons de respiration
  {
    id: 'white-noise',
    title: 'Bruit blanc doux',
    description: 'Calme immédiat',
    duration: 5,
    category: 'breathing',
    emoji: '🌬️',
    filename: 'white-noise-calm.mp3',
    usage: 'Crise de craving, tension nerveuse',
    tip: 'À combiner avec respiration "craving killer" (3-2-5)',
    audioPath: getAudioPath('breathing', 'white-noise-calm.mp3')
  },
  {
    id: 'pink-noise',
    title: 'Bruit rose',
    description: 'Respiration profonde',
    duration: 10,
    category: 'breathing',
    emoji: '🌸',
    filename: 'pink-noise-calm.mp3',
    usage: 'Exercice 5-5 pendant 5 min',
    tip: 'Rythme ton souffle sur les vagues du son',
    audioPath: getAudioPath('breathing', 'pink-noise-calm.mp3')
  },
  {
    id: 'pink-noise-asmr',
    title: 'Bruit rose ASMR',
    description: 'Mix apaisant multi-sensoriel',
    duration: 8,
    category: 'breathing',
    emoji: '🌊',
    filename: 'pink-noise-asmr.mp3',
    usage: 'Relaxation profonde et respiration consciente',
    tip: 'Parfait pour une session de respiration guidée',
    audioPath: getAudioPath('breathing', 'pink-noise-asmr.mp3')
  },
  
  // Sons de la nature
  {
    id: 'ocean-waves',
    title: 'Vagues lentes',
    description: 'Ancrage océanique',
    duration: 7,
    category: 'nature',
    emoji: '🌊',
    filename: 'ocean-waves-slow.mp3',
    usage: 'Méditation du soir ou pause calme',
    tip: 'Inspire sur le flux, expire sur le reflux',
    audioPath: getAudioPath('nature', 'ocean-waves-slow.mp3')
  },
  {
    id: 'gentle-rain',
    title: 'Pluie légère',
    description: 'Purification mentale',
    duration: 10,
    category: 'nature',
    emoji: '🌧️',
    filename: 'gentle-rain-ambience.mp3',
    usage: 'Méditation pleine conscience',
    tip: 'Associe le son à la visualisation "je nettoie mon corps de la fumée"',
    audioPath: getAudioPath('nature', 'gentle-rain-ambience.mp3')
  },
  {
    id: 'forest-birds',
    title: 'Forêt & oiseaux',
    description: 'Retour à la nature',
    duration: 6,
    category: 'nature',
    emoji: '🍃',
    filename: 'forest-morning-ambience.mp3',
    usage: 'Marche consciente ou respiration abdominale',
    tip: 'Ferme les yeux et imagine l\'air pur entrer dans tes poumons',
    audioPath: getAudioPath('nature', 'forest-morning-ambience.mp3')
  },
  {
    id: 'forest-atmosphere',
    title: 'Atmosphère forestière',
    description: 'Immersion naturelle profonde',
    duration: 8,
    category: 'nature',
    emoji: '🌲',
    filename: 'forest-atmosphere.mp3',
    usage: 'Méditation en pleine nature ou visualisation',
    tip: 'Imagine-toi marcher dans cette forêt paisible',
    audioPath: getAudioPath('nature', 'forest-atmosphere.mp3')
  },
  {
    id: 'rain-whisper',
    title: 'Murmure de pluie',
    description: 'Pluie douce et apaisante',
    duration: 6,
    category: 'nature',
    emoji: '💧',
    filename: 'rain-whisper-calm.mp3',
    usage: 'Relaxation profonde et endormissement',
    tip: 'Laisse-toi bercer par le rythme de la pluie',
    audioPath: getAudioPath('nature', 'rain-whisper-calm.mp3')
  },
  
  // Sons de méditation
  {
    id: 'tibetan-bowl',
    title: 'Bol tibétain',
    description: 'Reset mental',
    duration: 8,
    category: 'meditation',
    emoji: '🕯️',
    filename: 'tibetan-bowl-meditation.mp3',
    usage: 'Après une journée stressante ou après un échec (rechute)',
    tip: 'Inspire à chaque vibration, expire en suivant sa résonance',
    audioPath: getAudioPath('meditation', 'tibetan-bowl-meditation.mp3')
  },
  {
    id: 'tibetan-bowl-healing',
    title: 'Bol tibétain thérapeutique',
    description: 'Guérison profonde',
    duration: 10,
    category: 'meditation',
    emoji: '🔮',
    filename: 'tibetan-bowl-healing.mp3',
    usage: 'Séance de guérison et purification énergétique',
    tip: 'Laisse les vibrations nettoyer ton corps et ton esprit',
    audioPath: getAudioPath('meditation', 'tibetan-bowl-healing.mp3')
  },
  {
    id: 'calm-piano',
    title: 'Piano lent',
    description: 'Clarté intérieure',
    duration: 5,
    category: 'meditation',
    emoji: '🪶',
    filename: 'calm-piano-loop.mp3',
    usage: 'Méditation gratitude / visualisation du "nouveau toi"',
    tip: 'À utiliser avec la méditation de gratitude quotidienne',
    audioPath: getAudioPath('meditation', 'calm-piano-loop.mp3')
  },
  {
    id: 'calm-meditation',
    title: 'Méditation calme',
    description: 'Relaxation profonde guidée',
    duration: 12,
    category: 'meditation',
    emoji: '🧘',
    filename: 'calm-meditation.mp3',
    usage: 'Session de méditation complète et guidée',
    tip: 'Parfait pour débuter ou approfondir ta pratique méditative',
    audioPath: getAudioPath('meditation', 'calm-meditation.mp3')
  },
  {
    id: 'relaxation-meditation',
    title: 'Méditation relaxation',
    description: 'Détente et lâcher-prise',
    duration: 8,
    category: 'meditation',
    emoji: '😌',
    filename: 'relaxation-meditation.mp3',
    usage: 'Relaxation profonde et réduction du stress',
    tip: 'Idéal pour évacuer les tensions accumulées',
    audioPath: getAudioPath('meditation', 'relaxation-meditation.mp3')
  },
  
  // Fréquences
  {
    id: 'alpha-waves',
    title: 'Fréquences Alpha (10 Hz)',
    description: 'Contrôle et détente',
    duration: 10,
    category: 'frequencies',
    emoji: '🧠',
    filename: 'alpha-waves-focus.mp3',
    usage: 'Avant une situation stressante (réunion, trajet, etc.)',
    tip: 'À écouter avec casque audio',
    audioPath: getAudioPath('frequencies', 'alpha-waves-focus.mp3')
  },
  {
    id: 'theta-waves',
    title: 'Fréquences Theta (6 Hz)',
    description: 'Lâcher prise total',
    duration: 10,
    category: 'frequencies',
    emoji: '🌑',
    filename: 'theta-binaural-calm.mp3',
    usage: 'Méditation du soir ou avant le sommeil',
    tip: 'Casque recommandé',
    audioPath: getAudioPath('frequencies', 'theta-binaural-calm.mp3')
  },
  {
    id: 'meditation-binaural',
    title: 'Méditation binaurale 10Hz',
    description: 'Synchronisation cérébrale',
    duration: 8,
    category: 'frequencies',
    emoji: '⚡',
    filename: 'meditation-binaural-10hz.mp3',
    usage: 'Amélioration de la concentration et de la méditation',
    tip: 'Casque stéréo obligatoire pour l\'effet binaural',
    audioPath: getAudioPath('frequencies', 'meditation-binaural-10hz.mp3')
  },
  
  // Mix
  {
    id: 'craving-reset',
    title: 'Mix sensoriel',
    description: 'Craving Reset 3 min',
    duration: 3,
    category: 'mixed',
    emoji: '🔔',
    filename: 'calm-deep-meditation-mix.mp3',
    usage: 'Quand l\'envie monte → déclenche-le à la place d\'une cigarette',
    tip: 'Bouton « Craving Reset » = lecture auto de ce son + animation de respiration',
    audioPath: getAudioPath('mixed', 'calm-deep-meditation-mix.mp3')
  },
  {
    id: 'gentle-rain-mix',
    title: 'Mix pluie douce',
    description: 'Ambiance apaisante complète',
    duration: 6,
    category: 'mixed',
    emoji: '🌦️',
    filename: 'gentle-rain-mix.mp3',
    usage: 'Relaxation générale et réduction du stress',
    tip: 'Parfait pour une pause détente en journée',
    audioPath: getAudioPath('mixed', 'gentle-rain-mix.mp3')
  }
];

export const categoryInfo = {
  breathing: { name: 'Respiration', emoji: '🫁', color: '#4A90E2' },
  nature: { name: 'Nature', emoji: '🌿', color: '#7ED321' },
  meditation: { name: 'Méditation', emoji: '🧘', color: '#F5A623' },
  frequencies: { name: 'Fréquences', emoji: '🧠', color: '#BD10E0' },
  mixed: { name: 'Mix', emoji: '🔔', color: '#FF6B6B' }
};

// Instructions pour ajouter vos fichiers audio :
/*
1. Placez vos fichiers MP3 dans le dossier assets/sounds/ avec la structure :
   - assets/sounds/breathing/white-noise-calm.mp3
   - assets/sounds/breathing/pink-noise-calm.mp3
   - assets/sounds/nature/ocean-waves-slow.mp3
   - etc.

2. Décommentez la ligne dans getAudioPath() pour activer les vrais fichiers

3. Les noms de fichiers doivent correspondre exactement à ceux définis dans soundsLibrary

4. Formats supportés : .mp3, .wav, .m4a

5. Taille recommandée : < 10MB par fichier pour de bonnes performances
*/
