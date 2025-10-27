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

const { width, height } = Dimensions.get('window');

interface MeditationAntiSmokingExercisesProps {
  onClose: () => void;
  onStatsUpdate?: (stats: { panicCount: number; successCount: number }) => void;
  panicStats?: { panicCount: number; successCount: number };
}

type MeditationPhase = 'preparation' | 'instruction' | 'practice' | 'reflection';

const MeditationAntiSmokingExercises: React.FC<MeditationAntiSmokingExercisesProps> = ({ onClose, onStatsUpdate, panicStats = { panicCount: 0, successCount: 0 } }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<MeditationPhase>('preparation');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Configuration des 5 exercices de méditation anti-tabac
  const meditationExercises = {
    'breathing_awareness': {
      name: 'Méditation de la respiration consciente',
      description: '3 à 5 min - Revenir à l\'instant présent',
      duration: 5, // en minutes
      phases: {
        preparation: { duration: 30, instruction: 'Asseyez-vous confortablement et fermez les yeux', color: '#4A90E2' },
        instruction: { duration: 60, instruction: 'Inspirez profondément par le nez, expirez lentement par la bouche', color: '#7ED321' },
        practice: { duration: 240, instruction: 'Portez votre attention uniquement sur votre respiration', color: '#F5A623' },
        reflection: { duration: 30, instruction: 'Observez l\'envie comme une pensée qui passe, sans la juger', color: '#BD10E0' },
      },
      guidedText: [
        'Bienvenue dans cette méditation de respiration consciente.',
        'Asseyez-vous confortablement et fermez les yeux.',
        'Inspirez profondément par le nez, puis expirez lentement par la bouche.',
        'Portez votre attention uniquement sur votre respiration.',
        'Observez l\'air qui entre et qui sort de vos narines.',
        'Quand une envie de fumer monte, observez-la comme une pensée qui passe.',
        'Ne la jugez pas, ne vous y attachez pas.',
        'Revenez doucement à votre respiration à chaque fois que votre esprit s\'échappe.',
        'Ressentez la paix qui grandit en vous.',
        'Quand vous êtes prêt, ouvrez doucement les yeux.'
      ]
    },
    'body_scan': {
      name: 'Scan corporel de l\'envie',
      description: '5 min - Ressentir physiquement l\'envie',
      duration: 5,
      phases: {
        preparation: { duration: 30, instruction: 'Allongez-vous ou asseyez-vous confortablement', color: '#4A90E2' },
        instruction: { duration: 60, instruction: 'Commencez par observer votre corps', color: '#7ED321' },
        practice: { duration: 240, instruction: 'Cherchez où l\'envie se manifeste dans votre corps', color: '#F5A623' },
        reflection: { duration: 30, instruction: 'Respirez dans cette zone, comme pour lui faire de la place', color: '#BD10E0' },
      },
      guidedText: [
        'Bienvenue dans cette méditation de scan corporel.',
        'Allongez-vous ou asseyez-vous confortablement.',
        'Fermez les yeux et commencez par observer votre corps.',
        'Portez votre attention sur votre tête, votre cou, vos épaules.',
        'Quand vous ressentez l\'envie de fumer, cherchez où elle se manifeste.',
        'Est-ce dans votre gorge ? Votre ventre ? Vos mains ?',
        'Respirez dans cette zone, comme pour lui faire de la place.',
        'Observez l\'intensité de l\'envie. Elle va monter... puis redescendre.',
        'Comme une vague qui monte et redescend naturellement.',
        'Ressentez votre corps entier, détendu et en paix.'
      ]
    },
    'craving_meditation': {
      name: 'Méditation de l\'envie passagère',
      description: '2 à 3 min - Visualiser l\'envie comme temporaire',
      duration: 3,
      phases: {
        preparation: { duration: 20, instruction: 'Fermez les yeux et respirez calmement', color: '#4A90E2' },
        instruction: { duration: 40, instruction: 'Imaginez votre envie comme un nuage qui passe', color: '#7ED321' },
        practice: { duration: 120, instruction: 'Répétez : "Ce n\'est qu\'une envie. Elle va passer"', color: '#F5A623' },
        reflection: { duration: 20, instruction: 'Ressentez votre force intérieure', color: '#BD10E0' },
      },
      guidedText: [
        'Bienvenue dans cette méditation de l\'envie passagère.',
        'Fermez les yeux et respirez calmement.',
        'Imaginez votre envie comme un nuage qui passe dans le ciel.',
        'Ou comme une vague qui monte puis redescend.',
        'Répétez-vous : "Ce n\'est qu\'une envie. Elle va passer."',
        'Répétez : "Je suis plus fort(e) qu\'elle."',
        'Continuez à respirer lentement.',
        'Observez l\'envie diminuer naturellement.',
        'Ressentez votre force intérieure grandir.',
        'Vous êtes plus fort que cette envie temporaire.'
      ]
    },
    'walking_meditation': {
      name: 'Méditation marchée',
      description: '5 à 10 min - Marcher en pleine conscience',
      duration: 8,
      phases: {
        preparation: { duration: 30, instruction: 'Trouvez un endroit calme pour marcher', color: '#4A90E2' },
        instruction: { duration: 60, instruction: 'Marchez lentement, en posant chaque pas consciemment', color: '#7ED321' },
        practice: { duration: 420, instruction: 'Soyez attentif à chaque sensation', color: '#F5A623' },
        reflection: { duration: 30, instruction: 'Si l\'envie revient, observez-la sans y répondre', color: '#BD10E0' },
      },
      guidedText: [
        'Bienvenue dans cette méditation marchée.',
        'Sortez marcher, même 5 minutes, dans un endroit calme.',
        'Marchez lentement, en posant chaque pas consciemment.',
        'Soyez attentif à chaque sensation.',
        'Le contact de votre pied avec le sol.',
        'Le vent sur votre peau.',
        'Les bruits autour de vous.',
        'Si l\'envie revient, observez-la sans y répondre.',
        'Continuez à marcher en pleine conscience.',
        'Ressentez la paix qui grandit en vous.'
      ]
    },
    'motivation_meditation': {
      name: 'Méditation sur la motivation',
      description: '3 à 5 min - Se reconnecter à ses raisons',
      duration: 5,
      phases: {
        preparation: { duration: 30, instruction: 'Fermez les yeux et respirez calmement', color: '#4A90E2' },
        instruction: { duration: 60, instruction: 'Rappelez-vous pourquoi vous voulez arrêter', color: '#7ED321' },
        practice: { duration: 240, instruction: 'Visualisez-vous libéré de la cigarette', color: '#F5A623' },
        reflection: { duration: 30, instruction: 'Ressentez la fierté et la paix intérieure', color: '#BD10E0' },
      },
      guidedText: [
        'Bienvenue dans cette méditation sur la motivation.',
        'Fermez les yeux et respirez calmement.',
        'Rappelez-vous pourquoi vous voulez arrêter de fumer.',
        'Votre santé, votre entourage, votre liberté...',
        'Visualisez-vous libéré de la cigarette.',
        'Heureux, en pleine forme, libre.',
        'Ressentez la fierté de cette décision.',
        'Ressentez la paix intérieure qui grandit.',
        'Vous êtes sur le bon chemin.',
        'Chaque jour sans cigarette est une victoire.'
      ]
    }
  };

  const [selectedExercise, setSelectedExercise] = useState<keyof typeof meditationExercises>('breathing_awareness');
  const [showStats, setShowStats] = useState(false);
  const [currentGuidedText, setCurrentGuidedText] = useState(0);
  
  const currentExercise = meditationExercises[selectedExercise];
  const phases = currentExercise.phases;

  // Fonction pour parler le texte
  const speakText = async (text: string) => {
    if (!soundEnabled) return;
    
    try {
      console.log('🔊 Instruction vocale:', text);
    } catch (error) {
      console.log('Erreur de synthèse vocale:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let guidedTextInterval: NodeJS.Timeout;
    
    if (isActive) {
      // Timer principal
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            // Passer à la phase suivante
            const currentPhaseIndex = Object.keys(phases).indexOf(phase);
            const nextPhaseIndex = (currentPhaseIndex + 1) % Object.keys(phases).length;
            const nextPhase = Object.keys(phases)[nextPhaseIndex] as MeditationPhase;
            
            setPhase(nextPhase);
            
            // Si on revient à la première phase, l'exercice est terminé
            const firstPhase = Object.keys(phases)[0] as keyof typeof phases;
            if (nextPhase === firstPhase) {
              setIsActive(false);
              showSuccessQuestion();
              return 0;
            }
            
            return phases[nextPhase].duration;
          }
          return prev - 1;
        });
      }, 1000);

      // Guidage vocal
      guidedTextInterval = setInterval(() => {
        if (currentGuidedText < currentExercise.guidedText.length) {
          speakText(currentExercise.guidedText[currentGuidedText]);
          setCurrentGuidedText(prev => prev + 1);
        }
      }, (currentExercise.duration * 60 * 1000) / currentExercise.guidedText.length);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (guidedTextInterval) clearInterval(guidedTextInterval);
    };
  }, [isActive, phase, currentGuidedText]);

  useEffect(() => {
    if (isActive) {
      setTimeRemaining(phases[phase].duration);
      
      // Animation de pulsation douce
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

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
    }
  }, [phase, isActive]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('preparation');
    setCurrentGuidedText(0);
    
    // Commencer le guidage vocal
    setTimeout(() => {
      speakText(currentExercise.guidedText[0]);
      setCurrentGuidedText(1);
    }, 1000);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('preparation');
    setTimeRemaining(0);
    setCurrentGuidedText(0);
    
    // Reset animations
    scaleAnim.setValue(0.3);
    opacityAnim.setValue(0.7);
    pulseAnim.setValue(1);
    fadeAnim.setValue(0);
    
    // Afficher la popup de fin comme pour les sons
    showSuccessQuestion();
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
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
              <Text style={styles.overlayTitle}>Méditations Anti-Tabac</Text>
              <View style={styles.placeholder} />
            </View>
            <Text style={styles.overlaySubtitle}>Choisissez selon votre besoin</Text>
            
            <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
              {Object.entries(meditationExercises).map(([key, exercise]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.exerciseRow,
                    selectedExercise === key && styles.exerciseRowSelected
                  ]}
                  onPress={() => setSelectedExercise(key as keyof typeof meditationExercises)}
                >
                  <View style={styles.exerciseRowLeft}>
                    <Text style={styles.exerciseRowEmoji}>
                      {key === 'breathing_awareness' ? '🫁' : 
                       key === 'body_scan' ? '🔄' : 
                       key === 'craving_meditation' ? '☁️' : 
                       key === 'walking_meditation' ? '🚶‍♂️' : '💪'}
                    </Text>
                    <View style={styles.exerciseRowText}>
                      <Text style={styles.exerciseRowName}>{exercise.name}</Text>
                      <Text style={styles.exerciseRowDesc}>{exercise.description}</Text>
                    </View>
                  </View>
                  <View style={styles.exerciseRowRight}>
                    <Text style={styles.exerciseRowTime}>{exercise.duration}min</Text>
                    {selectedExercise === key && (
                      <Text style={styles.exerciseRowCheck}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Bouton Confirmer */}
            <TouchableOpacity 
              style={styles.startButtonFull} 
              onPress={startExercise}
            >
              <Text style={styles.startButtonFullText}>Commencer la méditation</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Cercle de méditation */}
      {isActive && (
        <View style={styles.meditationContainer}>
          {/* Instruction au-dessus du cercle */}
          <Text style={styles.instructionText}>{phases[phase].instruction}</Text>
          
          {/* Cercle avec chrono au centre */}
          <Animated.View
            style={[
              styles.meditationCircle,
              {
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) },
                ],
                opacity: fadeAnim,
                backgroundColor: phases[phase].color,
              },
            ]}
          >
            <View style={styles.innerCircle}>
              <Text style={styles.meditationEmoji}>🧘</Text>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.phaseText}>{phase === 'preparation' ? 'Préparation' : 
                                                phase === 'instruction' ? 'Instruction' :
                                                phase === 'practice' ? 'Pratique' : 'Réflexion'}</Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Boutons de contrôle */}
      <View style={styles.controlsContainer}>
        {!isActive ? (
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.startButton} onPress={startExercise}>
              <Text style={styles.startButtonText}>🧘 Commencer</Text>
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
            <Text style={styles.statsTitle}>Statistiques Méditation</Text>
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
    width: 60,
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
  meditationContainer: {
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
    paddingHorizontal: 20,
  },
  meditationCircle: {
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
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 4,
  },
  phaseText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
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

export default MeditationAntiSmokingExercises;
