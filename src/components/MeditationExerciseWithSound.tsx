import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface MeditationExerciseWithSoundProps {
  onClose: () => void;
  onStatsUpdate?: (stats: { panicCount: number; successCount: number }) => void;
}

type MeditationType = 'mindfulness' | 'body_scan' | 'loving_kindness' | 'breathing_awareness';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // en minutes
  type: MeditationType;
  instructions: string[];
  benefits: string[];
  guidedText: string[]; // Texte pour le guidage vocal
}

const meditationSessions: MeditationSession[] = [
  {
    id: 'mindfulness_5',
    title: '🧘 Méditation de Pleine Conscience',
    description: '5 minutes de méditation guidée pour se recentrer',
    duration: 5,
    type: 'mindfulness',
    instructions: [
      'Asseyez-vous confortablement',
      'Fermez les yeux et respirez naturellement',
      'Portez votre attention sur votre respiration',
      'Laissez passer les pensées sans les juger',
      'Revenez doucement à votre respiration'
    ],
    benefits: [
      'Réduction du stress',
      'Amélioration de la concentration',
      'Meilleure gestion des émotions'
    ],
    guidedText: [
      'Bienvenue dans cette méditation de pleine conscience.',
      'Asseyez-vous confortablement et fermez les yeux.',
      'Portez votre attention sur votre respiration naturelle.',
      'Observez l\'air qui entre et sort de vos narines.',
      'Si votre esprit vagabonde, ramenez doucement votre attention sur votre respiration.',
      'Laissez passer les pensées comme des nuages dans le ciel.',
      'Revenez toujours à votre respiration, votre ancre.',
      'Prenez conscience de votre corps, de votre posture.',
      'Ressentez la paix qui grandit en vous.',
      'Quand vous êtes prêt, ouvrez doucement les yeux.'
    ]
  },
  {
    id: 'body_scan_10',
    title: '🔄 Balayage Corporel',
    description: '10 minutes pour détendre chaque partie du corps',
    duration: 10,
    type: 'body_scan',
    instructions: [
      'Allongez-vous confortablement',
      'Commencez par les orteils',
      'Portez votre attention sur chaque partie du corps',
      'Relâchez les tensions au fur et à mesure',
      'Terminez par le sommet de la tête'
    ],
    benefits: [
      'Détente musculaire profonde',
      'Réduction des tensions',
      'Meilleur sommeil'
    ],
    guidedText: [
      'Bienvenue dans cette méditation de balayage corporel.',
      'Allongez-vous confortablement et fermez les yeux.',
      'Commencez par porter votre attention sur vos orteils.',
      'Ressentez chaque orteil, relâchez toute tension.',
      'Remontez lentement vers vos pieds, vos chevilles.',
      'Continuez avec vos mollets, vos genoux.',
      'Portez votre attention sur vos cuisses, vos hanches.',
      'Remontez vers votre bassin, votre abdomen.',
      'Observez votre poitrine qui se soulève et s\'abaisse.',
      'Portez votre attention sur vos épaules, vos bras.',
      'Ressentez vos mains, vos doigts, relâchez toute tension.',
      'Remontez vers votre cou, votre gorge.',
      'Portez votre attention sur votre visage, votre front.',
      'Terminez par le sommet de votre tête.',
      'Prenez conscience de votre corps entier, détendu.',
      'Quand vous êtes prêt, ouvrez doucement les yeux.'
    ]
  },
  {
    id: 'loving_kindness_7',
    title: '💝 Méditation de Bienveillance',
    description: '7 minutes pour cultiver la compassion',
    duration: 7,
    type: 'loving_kindness',
    instructions: [
      'Asseyez-vous dans une position confortable',
      'Commencez par vous souhaiter du bien',
      'Étendez cette bienveillance à vos proches',
      'Incluez des personnes neutres',
      'Terminez par tous les êtres vivants'
    ],
    benefits: [
      'Développement de l\'empathie',
      'Amélioration des relations',
      'Réduction de l\'anxiété sociale'
    ],
    guidedText: [
      'Bienvenue dans cette méditation de bienveillance.',
      'Asseyez-vous confortablement et fermez les yeux.',
      'Commencez par vous souhaiter du bien à vous-même.',
      'Répétez mentalement : "Puissé-je être heureux, en paix, libre de souffrance."',
      'Maintenant, pensez à une personne que vous aimez.',
      'Souhaitez-lui du bonheur : "Puisses-tu être heureux, en paix, libre de souffrance."',
      'Étendez cette bienveillance à une personne neutre.',
      'Souhaitez-lui également du bonheur et de la paix.',
      'Maintenant, incluez même les personnes difficiles.',
      'Souhaitez-leur également du bonheur et de la paix.',
      'Étendez cette bienveillance à tous les êtres vivants.',
      'Ressentez l\'amour et la compassion qui grandissent en vous.',
      'Quand vous êtes prêt, ouvrez doucement les yeux.'
    ]
  },
  {
    id: 'breathing_awareness_3',
    title: '🌬️ Conscience de la Respiration',
    description: '3 minutes pour se connecter à votre souffle',
    duration: 3,
    type: 'breathing_awareness',
    instructions: [
      'Asseyez-vous droit mais détendu',
      'Fermez les yeux',
      'Observez votre respiration naturelle',
      'Ne forcez rien, laissez faire',
      'Ressentez l\'air entrer et sortir'
    ],
    benefits: [
      'Calme immédiat',
      'Réduction de l\'anxiété',
      'Meilleure oxygénation'
    ],
    guidedText: [
      'Bienvenue dans cette méditation de conscience de la respiration.',
      'Asseyez-vous droit mais détendu, fermez les yeux.',
      'Observez votre respiration naturelle, sans la modifier.',
      'Ressentez l\'air qui entre par vos narines.',
      'Observez la pause naturelle entre l\'inspiration et l\'expiration.',
      'Ressentez l\'air qui sort par vos narines.',
      'Observez la pause naturelle entre l\'expiration et l\'inspiration.',
      'Ressentez votre corps qui respire naturellement.',
      'Laissez votre respiration être ce qu\'elle est.',
      'Quand vous êtes prêt, ouvrez doucement les yeux.'
    ]
  }
];

const MeditationExerciseWithSound: React.FC<MeditationExerciseWithSoundProps> = ({ onClose, onStatsUpdate }) => {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentGuidedText, setCurrentGuidedText] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Fonction pour parler le texte
  const speakText = async (text: string) => {
    if (!soundEnabled) return;
    
    try {
      // En React Native, on utilise simplement les logs pour l'instant
      // Dans une vraie app, on utiliserait react-native-tts ou expo-speech
      console.log('🔊 Instruction vocale:', text);
    } catch (error) {
      console.log('Erreur de synthèse vocale:', error);
    }
  };

  useEffect(() => {
    if (isActive && selectedSession) {
      setTimeRemaining(selectedSession.duration * 60);
      
      // Animation de pulsation continue
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Animation de progression
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: selectedSession.duration * 60 * 1000,
        useNativeDriver: false,
      }).start();

      // Timer
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Guidage vocal
      const guidedTextInterval = setInterval(() => {
        if (currentGuidedText < selectedSession.guidedText.length) {
          speakText(selectedSession.guidedText[currentGuidedText]);
          setCurrentGuidedText(prev => prev + 1);
        }
      }, (selectedSession.duration * 60 * 1000) / selectedSession.guidedText.length);

      return () => {
        clearInterval(interval);
        clearInterval(guidedTextInterval);
        pulseAnimation.stop();
        speechSynthesis.cancel();
      };
    }
  }, [isActive, selectedSession, currentGuidedText]);

  const startMeditation = (session: MeditationSession) => {
    setSelectedSession(session);
    setIsActive(true);
    setCurrentInstruction(0);
    setCurrentGuidedText(0);
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Commencer le guidage vocal
    setTimeout(() => {
      speakText(session.guidedText[0]);
      setCurrentGuidedText(1);
    }, 1000);
  };

  const stopMeditation = () => {
    setIsActive(false);
    setSelectedSession(null);
    setTimeRemaining(0);
    setCurrentInstruction(0);
    setCurrentGuidedText(0);
    
    // Arrêter tous les sons
    // En React Native, pas besoin d'arrêter speechSynthesis
    
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    pulseAnim.setValue(1);
    progressAnim.setValue(0);
    
    // Afficher la popup de fin comme pour les sons
    showSuccessQuestion();
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      speechSynthesis.cancel();
    }
  };

  // Fonction pour demander si l'envie a été arrêtée (comme dans SoundsLibrary)
  const showSuccessQuestion = () => {
    Alert.alert(
      '🧘 Session terminée',
      'Ta méditation est terminée. L\'envie de fumer a-t-elle disparu ?',
      [
        {
          text: '❌ Non, toujours envie',
          style: 'destructive',
          onPress: () => showAnotherMeditationQuestion()
        },
        {
          text: '✅ Oui, envie arrêtée !',
          style: 'default',
          onPress: () => updatePanicStats(true)
        }
      ]
    );
  };

  // Fonction pour proposer une autre méditation
  const showAnotherMeditationQuestion = () => {
    Alert.alert(
      '🔄 Autre méditation ?',
      'Veux-tu essayer une autre méditation ?',
      [
        {
          text: 'Non, merci',
          style: 'cancel',
          onPress: () => updatePanicStats(false)
        },
        {
          text: 'Oui, autre méditation',
          style: 'default',
          onPress: () => {
            // Laisser l'utilisateur choisir une autre méditation
            console.log('Utilisateur veut essayer une autre méditation');
          }
        }
      ]
    );
  };

  // Fonction pour mettre à jour les statistiques de panique
  const updatePanicStats = (success: boolean) => {
    if (onStatsUpdate) {
      onStatsUpdate({
        panicCount: 1, // Une utilisation du bouton panique
        successCount: success ? 1 : 0 // Succès ou échec
      });
    }
    
    if (success) {
      Alert.alert(
        '🎉 Bravo !',
        'Félicitations ! Tu as réussi à surmonter cette envie. Continue comme ça !',
        [{ text: 'Merci !', onPress: onClose }]
      );
    } else {
      Alert.alert(
        '💪 Continue !',
        'Pas de souci, c\'est normal. Chaque tentative compte. Tu peux toujours réessayer !',
        [{ text: 'D\'accord', onPress: onClose }]
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!selectedSession || !isActive) return 0;
    const elapsed = (selectedSession.duration * 60) - timeRemaining;
    return (elapsed / (selectedSession.duration * 60)) * 100;
  };

  if (isActive && selectedSession) {
    return (
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        {/* Fond étoilé animé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.star,
                {
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  opacity: pulseAnim,
                },
              ]}
            />
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={stopMeditation}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedSession.title}</Text>
        </View>

        {/* Cercle de méditation */}
        <Animated.View
          style={[
            styles.meditationCircle,
            {
              transform: [
                { scale: pulseAnim },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.meditationEmoji}>🧘</Text>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.progressText}>
              {Math.round(getProgressPercentage())}% terminé
            </Text>
          </View>
        </Animated.View>

        {/* Instruction actuelle */}
        <Animated.View
          style={[
            styles.instructionContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.instructionText}>
            {selectedSession.instructions[currentInstruction]}
          </Text>
        </Animated.View>

        {/* Barre de progression */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Contrôles audio */}
        <View style={styles.audioControls}>
          <TouchableOpacity 
            style={[styles.soundButton, soundEnabled && styles.soundButtonActive]}
            onPress={toggleSound}
          >
            <Text style={styles.soundButtonText}>
              {soundEnabled ? '🔊 Guidage vocal activé' : '🔇 Guidage vocal désactivé'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bouton d'arrêt */}
        <TouchableOpacity style={styles.stopButton} onPress={stopMeditation}>
          <Text style={styles.stopButtonText}>⏹️ Terminer</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0F0F23', '#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      {/* Fond apaisant avec particules flottantes */}
      <View style={styles.backgroundContainer}>
        {Array.from({ length: 25 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingParticle,
              {
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.4 + 0.1,
                transform: [{ scale: Math.random() * 0.6 + 0.3 }],
              },
            ]}
          />
        ))}
      </View>

      {/* Header élégant */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeButtonInner}>
            <Text style={styles.closeButtonText}>✕</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Méditation Guidée</Text>
          <Text style={styles.subtitle}>Choisissez votre séance apaisante</Text>
        </View>
      </View>

      {/* Liste des séances */}
      <ScrollView style={styles.sessionsContainer} showsVerticalScrollIndicator={false}>
        {meditationSessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            onPress={() => startMeditation(session)}
          >
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionDuration}>{session.duration} min</Text>
            </View>
            <Text style={styles.sessionDescription}>{session.description}</Text>
            
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Bénéfices :</Text>
              {session.benefits.map((benefit, index) => (
                <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
              ))}
            </View>

            <View style={styles.startSessionButton}>
              <Text style={styles.startSessionText}>Commencer avec guidage vocal</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingParticle: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1.5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    zIndex: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  sessionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  sessionDuration: {
    color: '#8B45FF',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(139, 69, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionDescription: {
    color: '#E2E8F0',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 15,
  },
  benefitsTitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitItem: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  startSessionButton: {
    backgroundColor: '#8B45FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startSessionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  meditationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 40,
    shadowColor: '#8B45FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meditationEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B45FF',
    borderRadius: 4,
  },
  audioControls: {
    alignItems: 'center',
    marginVertical: 20,
  },
  soundButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  soundButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10B981',
  },
  soundButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#F44336',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MeditationExerciseWithSound;
