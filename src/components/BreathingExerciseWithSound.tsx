import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface BreathingExerciseWithSoundProps {
  onClose: () => void;
  onStatsUpdate?: (stats: { panicCount: number; successCount: number }) => void;
  panicStats?: { panicCount: number; successCount: number };
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

const BreathingExerciseWithSound: React.FC<BreathingExerciseWithSoundProps> = ({ onClose, onStatsUpdate, panicStats = { panicCount: 0, successCount: 0 } }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Audio
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Configuration des 5 exercices anti-tabac
  const breathingExercises = {
    '4-7-8': {
      name: 'Respiration 4-7-8',
      description: 'Inspirez 4s, retenez 7s, expirez 8s',
      phases: {
        inhale: { duration: 4000, instruction: 'Inspirez par le nez', color: '#4A90E2' },
        hold: { duration: 7000, instruction: 'Retenez l\'air', color: '#7ED321' },
        exhale: { duration: 8000, instruction: 'Expirez par la bouche', color: '#F5A623' },
        pause: { duration: 1000, instruction: 'Pause', color: '#BD10E0' },
      },
      cycles: 3,
      totalTime: 1
    },
    'coherence': {
      name: 'Cohérence Cardiaque',
      description: 'Inspirez 5s, expirez 5s de manière rythmée',
      phases: {
        inhale: { duration: 5000, instruction: 'Inspirez lentement', color: '#4A90E2' },
        exhale: { duration: 5000, instruction: 'Expirez lentement', color: '#F5A623' },
      },
      cycles: 30, // 5 minutes
      totalTime: 5
    },
    'substitution': {
      name: 'Respiration Substitution',
      description: 'Simulez le geste de fumer avec de l\'air pur',
      phases: {
        inhale: { duration: 3000, instruction: 'Inspirez profondément', color: '#4A90E2' },
        exhale: { duration: 4000, instruction: 'Expirez lentement', color: '#F5A623' },
        pause: { duration: 2000, instruction: 'Visualisez la fumée sortir', color: '#BD10E0' },
      },
      cycles: 10,
      totalTime: 1.5
    },
    'abdominale': {
      name: 'Respiration Abdominale',
      description: 'Gonflez le ventre à l\'inspiration, dégonflez à l\'expiration',
      phases: {
        inhale: { duration: 4000, instruction: 'Inspirez, ventre se gonfle', color: '#4A90E2' },
        exhale: { duration: 4000, instruction: 'Expirez, ventre se dégonfle', color: '#F5A623' },
      },
      cycles: 20, // 3-5 minutes
      totalTime: 4
    },
    'craving': {
      name: 'Craving Killer',
      description: 'Inspirez fort 3s, bloquez 2s, expirez fort 5s',
      phases: {
        inhale: { duration: 3000, instruction: 'Inspirez à fond', color: '#4A90E2' },
        hold: { duration: 2000, instruction: 'Bloquez la respiration', color: '#7ED321' },
        exhale: { duration: 5000, instruction: 'Expirez fort et complètement', color: '#F5A623' },
        pause: { duration: 1000, instruction: 'Pause', color: '#BD10E0' },
      },
      cycles: 4,
      totalTime: 0.5
    }
  };

  const [selectedExercise, setSelectedExercise] = useState<keyof typeof breathingExercises>('4-7-8');
  const [showStats, setShowStats] = useState(false);
  const currentExercise = breathingExercises[selectedExercise];
  const phases = currentExercise.phases;

  const totalCycleTime = Object.values(phases).reduce((sum, phase) => sum + phase.duration, 0);

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

  // Fonction pour jouer un son de respiration
  const playBreathingSound = async (phase: BreathingPhase) => {
    if (!soundEnabled) return;
    
    try {
      // En React Native, on simule le son avec des logs
      // Dans une vraie app, on utiliserait expo-av ou react-native-sound
      console.log(`🔊 Son de respiration: ${phase} - ${phases[phase].soundText}`);
    } catch (error) {
      console.log('Erreur de son:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            // Passer à la phase suivante
            const currentPhaseIndex = Object.keys(phases).indexOf(phase);
            const nextPhaseIndex = (currentPhaseIndex + 1) % Object.keys(phases).length;
            const nextPhase = Object.keys(phases)[nextPhaseIndex] as BreathingPhase;
            
            setPhase(nextPhase);
            
            // Parler l'instruction et jouer le son
            speakText(phases[nextPhase].soundText);
            playBreathingSound(nextPhase);
            
            // Si on revient à la première phase, c'est un nouveau cycle
            const firstPhase = Object.keys(phases)[0] as keyof typeof phases;
            if (nextPhase === firstPhase) {
              setCycleCount(prev => {
                const newCount = prev + 1;
                // Arrêter si on a atteint le nombre de cycles recommandé
                if (newCount >= currentExercise.cycles) {
                  setIsActive(false);
                  setShowSuccessOverlay(true);
                }
                return newCount;
              });
            }
            
            return phases[nextPhase].duration / 1000;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phase]);

  useEffect(() => {
    if (isActive) {
      setTimeRemaining(phases[phase].duration / 1000);
      
      // Animation de respiration - plus douce
      const animateBreathing = () => {
        const targetScale = phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.7 : 1.0;
        const targetOpacity = 0.8;
        
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: targetScale,
            duration: phases[phase].duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: targetOpacity,
            duration: phases[phase].duration,
            useNativeDriver: true,
          }),
        ]).start();
      };

      // Animation de pulsation très douce
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
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

      animateBreathing();
    }
  }, [phase, isActive]);

  const startExercise = () => {
    setIsActive(true);
    setCycleCount(0);
    // Commencer par la première phase de l'exercice sélectionné
    const firstPhase = Object.keys(phases)[0] as keyof typeof phases;
    setPhase(firstPhase);
    
    // Commencer par parler l'instruction et jouer le son
    speakText(phases[firstPhase].soundText);
    playBreathingSound(firstPhase);
  };

  const stopExercise = () => {
    setIsActive(false);
    setCycleCount(0);
    setPhase('inhale');
    setTimeRemaining(0);
    
    // Arrêter tous les sons
    // En React Native, pas besoin d'arrêter speechSynthesis
    
    // Reset animations
    scaleAnim.setValue(0.3);
    opacityAnim.setValue(0.7);
    pulseAnim.setValue(1);
    
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
      '🫁 Session terminée',
      'Ton exercice de respiration est terminé. L\'envie de fumer a-t-elle disparu ?',
      [
        {
          text: '❌ Non, toujours envie',
          style: 'destructive',
          onPress: () => showAnotherBreathingQuestion()
        },
        {
          text: '✅ Oui, envie arrêtée !',
          style: 'default',
          onPress: () => updatePanicStats(true)
        }
      ]
    );
  };

  // Fonction pour proposer un autre exercice de respiration
  const showAnotherBreathingQuestion = () => {
    Alert.alert(
      '🔄 Autre exercice ?',
      'Veux-tu essayer un autre exercice de respiration ?',
      [
        {
          text: 'Non, merci',
          style: 'cancel',
          onPress: () => updatePanicStats(false)
        },
        {
          text: 'Oui, autre exercice',
          style: 'default',
          onPress: () => {
            // Laisser l'utilisateur choisir un autre exercice
            console.log('Utilisateur veut essayer un autre exercice de respiration');
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


  return (
    <View style={styles.container}>
      {/* Fond apaisant avec particules flottantes */}
      <View style={styles.backgroundContainer}>
        {Array.from({ length: 30 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingParticle,
              {
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.6 + 0.2,
                transform: [{ scale: Math.random() * 0.8 + 0.4 }],
              },
            ]}
          />
        ))}
      </View>

      {/* Header avec nom de l'exercice */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
          <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
        </View>
      </View>

      {/* Overlay de sélection d'exercices */}
      {!isActive && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <View style={styles.overlayHeader}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.overlayTitle}>Exercices de Respiration</Text>
              <View style={styles.placeholder} />
            </View>
            <Text style={styles.overlaySubtitle}>Choisissez selon votre besoin</Text>
            
            <View style={styles.exercisesList}>
              {Object.entries(breathingExercises).map(([key, exercise]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.exerciseRow,
                    selectedExercise === key && styles.exerciseRowSelected
                  ]}
                  onPress={() => setSelectedExercise(key as keyof typeof breathingExercises)}
                >
                  <View style={styles.exerciseRowLeft}>
                    <Text style={styles.exerciseRowEmoji}>
                      {key === '4-7-8' ? '🫁' : 
                       key === 'coherence' ? '🌊' : 
                       key === 'substitution' ? '🔥' : 
                       key === 'abdominale' ? '🧘‍♂️' : '🌬️'}
                    </Text>
                    <View style={styles.exerciseRowText}>
                      <Text style={styles.exerciseRowName}>{exercise.name}</Text>
                      <Text style={styles.exerciseRowDesc}>{exercise.description}</Text>
                    </View>
                  </View>
                  <View style={styles.exerciseRowRight}>
                    <Text style={styles.exerciseRowTime}>{exercise.totalTime}min</Text>
                    {selectedExercise === key && (
                      <Text style={styles.exerciseRowCheck}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Bouton Confirmer */}
            <TouchableOpacity 
              style={styles.startButtonFull} 
              onPress={startExercise}
            >
              <Text style={styles.startButtonFullText}>Commencer l'exercice</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Cercle de respiration minimaliste */}
      <View style={styles.breathingContainer}>
        {/* Instruction au-dessus de la balle */}
        <Text style={styles.instructionText}>{phases[phase].instruction}</Text>
        
        {/* Cercle avec chrono au centre */}
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
              ],
              opacity: opacityAnim,
              backgroundColor: phases[phase].color,
            },
          ]}
        />
        
        {/* Chrono et temps restant en dessous */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeRemaining}s</Text>
          <Text style={styles.remainingText}>
            {Math.max(0, currentExercise.cycles - cycleCount)} cycles restants
          </Text>
        </View>
      </View>

      {/* Boutons de contrôle */}
      <View style={styles.controlsContainer}>
        {!isActive ? (
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.startButton} onPress={startExercise}>
              <Text style={styles.startButtonText}>🚀 Commencer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statsButton} onPress={() => setShowStats(true)}>
              <Text style={styles.statsButtonText}>📊 Statistiques</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopExercise}>
            <Text style={styles.stopButtonText}>⏹️ Arrêter</Text>
          </TouchableOpacity>
        )}
      </View>


      {/* Overlay de statistiques */}
      {showStats && (
        <View style={styles.statsOverlay}>
          <View style={styles.statsContent}>
            <Text style={styles.statsTitle}>Statistiques Panique</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Exercices utilisés :</Text>
              <Text style={styles.statsValue}>{panicStats.panicCount} fois</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Aidés à résister :</Text>
              <Text style={styles.statsValue}>{panicStats.successCount} fois</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Taux de réussite :</Text>
              <Text style={styles.statsValue}>
                {panicStats.panicCount > 0 ? Math.round((panicStats.successCount / panicStats.panicCount) * 100) : 0}%
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.statsCloseButton} 
              onPress={() => setShowStats(false)}
            >
              <Text style={styles.statsCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
  },
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  exerciseDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    maxHeight: '90%',
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
    flex: 1,
  },
  placeholder: {
    width: 60, // Même largeur que le bouton retour pour centrer le titre
  },
  overlaySubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  exercisesList: {
    maxHeight: 400,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  exerciseRowSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  exerciseRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseRowEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  exerciseRowText: {
    flex: 1,
  },
  exerciseRowName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseRowDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  exerciseRowRight: {
    alignItems: 'flex-end',
  },
  exerciseRowTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    marginBottom: 4,
  },
  exerciseRowCheck: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.3,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
  },
  remainingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '400',
  },
  controlsContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  statsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  successContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  successQuestion: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  successButtonNo: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },
  successButtonYes: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  statsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statPreviewLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '400',
  },
  statPreviewValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  statsContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '400',
  },
  statsValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  startButtonFull: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  startButtonFullText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BreathingExerciseWithSound;
