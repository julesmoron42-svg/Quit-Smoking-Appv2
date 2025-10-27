import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { soundsLibrary, categoryInfo, SoundTrack } from '../config/soundsConfig';
import { useSubscription } from '../contexts/SubscriptionContextMock';

const { width, height } = Dimensions.get('window');

interface SoundsExerciseProps {
  onClose: () => void;
  onStatsUpdate?: (stats: { panicCount: number; successCount: number }) => void;
}

const SoundsExercise: React.FC<SoundsExerciseProps> = ({ onClose, onStatsUpdate }) => {
  const { isPremium } = useSubscription();
  const [selectedSound, setSelectedSound] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Vérification premium au chargement
  useEffect(() => {
    if (!isPremium) {
      Alert.alert(
        '🎵 Sons Premium',
        'Les sons apaisants sont disponibles avec l\'abonnement Premium. Voulez-vous vous abonner ?',
        [
          { text: 'Annuler', style: 'cancel', onPress: onClose },
          { text: 'S\'abonner', onPress: () => {
            onClose();
          }}
        ]
      );
    }
  }, [isPremium, onClose]);

  // Charger un son
  const loadSound = async (soundTrack: SoundTrack) => {
    // Vérification premium avant de charger le son
    if (!isPremium) {
      Alert.alert(
        '🎵 Sons Premium',
        'Les sons apaisants sont disponibles avec l\'abonnement Premium. Voulez-vous vous abonner ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'S\'abonner', onPress: () => {
            onClose();
          }}
        ]
      );
      return;
    }

    try {
      // Arrêter le son actuel s'il y en a un
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      setSelectedSound(soundTrack);
      setCurrentTime(0);
      setIsPlaying(false);

      console.log('🎵 Tentative de chargement:', {
        title: soundTrack.title,
        filename: soundTrack.filename,
        audioPath: soundTrack.audioPath
      });

      // Charger le nouveau son depuis les assets locaux
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundTrack.audioPath,
        { 
          shouldPlay: false,
          volume: volume,
          isLooping: false,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 1000,
        }
      );
      
      setSound(newSound);
      console.log(`🎵 Son chargé: ${soundTrack.title}`);
      
      // Ne pas jouer automatiquement, attendre que l'utilisateur clique sur play
      setIsPlaying(false);
      setHasPlayedSound(false);
      
      // Écouter la fin du son
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setCurrentTime(Math.floor(status.positionMillis / 1000));
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentTime(0);
            // Demander si l'envie a été arrêtée quand le son se termine automatiquement
            setTimeout(() => {
              showSuccessQuestion();
            }, 1000);
          }
        }
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement du son:', error);
      console.error('Son problématique:', soundTrack.title, soundTrack.filename);
      Alert.alert(
        'Erreur de chargement', 
        `Impossible de charger "${soundTrack.title}". Vérifiez que le fichier ${soundTrack.filename} existe et n'est pas corrompu.`
      );
    }
  };

  // Jouer/Pause
  const togglePlayPause = async () => {
    if (!selectedSound || !sound) return;
    
    // Vérification premium avant de jouer
    if (!isPremium) {
      Alert.alert(
        '🎵 Sons Premium',
        'Les sons apaisants sont disponibles avec l\'abonnement Premium. Voulez-vous vous abonner ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'S\'abonner', onPress: () => {
            onClose();
          }}
        ]
      );
      return;
    }

    try {
      if (isPlaying) {
        // Pause
        await sound.pauseAsync();
        setIsPlaying(false);
        console.log('⏸️ Pause du son');
      } else {
        // Play
        await sound.playAsync();
        setIsPlaying(true);
        setHasPlayedSound(true);
        console.log(`▶️ Lecture du son: ${selectedSound.title}`);
        
        // Écouter la fin du son
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setCurrentTime(Math.floor(status.positionMillis / 1000));
            if (status.didJustFinish) {
              setIsPlaying(false);
              setCurrentTime(0);
              // Demander si l'envie a été arrêtée quand le son se termine automatiquement
              setTimeout(() => {
                showSuccessQuestion();
              }, 1000);
            }
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      Alert.alert('Erreur', 'Impossible de jouer le son');
    }
  };

  // Arrêter
  const stopSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      } catch (error) {
        console.error('Erreur lors de l\'arrêt:', error);
      }
    }
    setIsPlaying(false);
    setCurrentTime(0);
    console.log('⏹️ Arrêt du son');
  };

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Fonction pour demander si l'envie a été arrêtée
  const showSuccessQuestion = () => {
    Alert.alert(
      '🎵 Session terminée',
      'Le son apaisant est terminé. L\'envie de fumer a-t-elle disparu ?',
      [
        {
          text: '❌ Non, toujours envie',
          style: 'destructive',
          onPress: () => showAnotherSoundQuestion()
        },
        {
          text: '✅ Oui, envie arrêtée !',
          style: 'default',
          onPress: () => updatePanicStats(true)
        }
      ]
    );
  };

  // Fonction pour proposer un autre son
  const showAnotherSoundQuestion = () => {
    Alert.alert(
      '🔄 Autre son ?',
      'Veux-tu essayer un autre son apaisant ?',
      [
        {
          text: 'Non, merci',
          style: 'cancel',
          onPress: () => updatePanicStats(false)
        },
        {
          text: 'Oui, autre son',
          style: 'default',
          onPress: () => {
            // Arrêter le son actuel et remettre l'utilisateur à l'écran de sélection
            console.log('Utilisateur veut essayer un autre son');
            stopSound();
            setSelectedSound(null);
            setIsActive(false);
            setCurrentTime(0);
            setIsPlaying(false);
            setHasPlayedSound(false);
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

  // Fonction pour gérer la fermeture avec suivi
  const handleClose = () => {
    // Arrêter le son automatiquement
    if (sound) {
      stopSound();
    }
    
    // Ne pas afficher de popup quand on ferme l'interface générale
    // Le popup n'apparaîtra que quand on quitte un son spécifique ou qu'il se termine
    onClose();
  };

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculer le pourcentage de progression
  const progressPercentage = selectedSound 
    ? (currentTime / (selectedSound.duration * 60)) * 100 
    : 0;

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
          <Text style={styles.exerciseTitle}>🎵 Sons Apaisants</Text>
          <Text style={styles.exerciseDescription}>Utilise des sons relaxants pour calmer tes envies</Text>
        </View>
      </View>

      {/* Overlay de sélection de sons */}
      {!isActive && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <View style={styles.overlayHeader}>
              <TouchableOpacity style={styles.backButton} onPress={handleClose}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.overlayTitle}>Sons Apaisants</Text>
              <View style={styles.placeholder} />
            </View>
            <Text style={styles.overlaySubtitle}>Choisissez selon votre besoin</Text>
            
            <ScrollView style={styles.soundsList} showsVerticalScrollIndicator={false}>
              {/* Affichage par catégories */}
              {Object.entries(categoryInfo).map(([categoryKey, categoryInfo]) => {
                const categorySounds = soundsLibrary.filter(sound => sound.category === categoryKey);
                if (categorySounds.length === 0) return null;

                return (
                  <View key={categoryKey} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>
                      {categoryInfo.emoji} {categoryInfo.name}
                    </Text>
                    
                    {categorySounds.map((soundTrack) => (
                      <TouchableOpacity
                        key={soundTrack.id}
                        style={[
                          styles.soundRow,
                          selectedSound?.id === soundTrack.id && styles.soundRowSelected
                        ]}
                        onPress={() => setSelectedSound(soundTrack)}
                      >
                        <View style={styles.soundRowLeft}>
                          <Text style={styles.soundRowEmoji}>{soundTrack.emoji}</Text>
                          <View style={styles.soundRowText}>
                            <Text style={styles.soundRowName}>{soundTrack.title}</Text>
                            <Text style={styles.soundRowDesc}>{soundTrack.description}</Text>
                          </View>
                        </View>
                        <View style={styles.soundRowRight}>
                          <Text style={styles.soundRowTime}>{soundTrack.duration}min</Text>
                          {selectedSound?.id === soundTrack.id && (
                            <Text style={styles.soundRowCheck}>✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
            
            {/* Bouton Confirmer */}
            <TouchableOpacity 
              style={[styles.startButtonFull, !selectedSound && styles.startButtonDisabled]} 
              onPress={() => {
                if (selectedSound) {
                  loadSound(selectedSound);
                  setIsActive(true);
                }
              }}
            >
              <Text style={styles.startButtonFullText}>Commencer le son</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Interface de lecture */}
      {isActive && selectedSound && (
        <View style={styles.playerOverlay}>
          <View style={styles.playerContent}>
            <View style={styles.playerHeader}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => {
                  // Afficher le popup quand on quitte un son spécifique
                  if (hasPlayedSound) {
                    Alert.alert(
                      '🎵 Son interrompu',
                      'Tu quittes ce son. L\'envie de fumer a-t-elle disparu ?',
                      [
                        {
                          text: '❌ Non, toujours envie',
                          style: 'destructive',
                          onPress: () => showAnotherSoundQuestion()
                        },
                        {
                          text: '✅ Oui, envie arrêtée !',
                          style: 'default',
                          onPress: () => {
                            updatePanicStats(true);
                            stopSound();
                            setSelectedSound(null);
                            setIsActive(false);
                          }
                        }
                      ]
                    );
                  } else {
                    // Si aucun son n'a été joué, retourner directement
                    stopSound();
                    setSelectedSound(null);
                    setIsActive(false);
                  }
                }}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.playerTitle}>🎵 {selectedSound.title}</Text>
              <View style={styles.placeholder} />
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerDescription}>{selectedSound.description}</Text>
              <Text style={styles.playerTime}>
                {formatTime(currentTime)} / {formatTime(selectedSound.duration * 60)}
              </Text>
            </View>
            
            {/* Barre de progression */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            
            {/* Boutons de contrôle */}
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlButton} onPress={stopSound}>
                <Text style={styles.controlButtonText}>⏹️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.controlButton, styles.playButtonMain]} onPress={togglePlayPause}>
                <Text style={styles.controlButtonText}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => {
                  const newVolume = volume > 0.1 ? volume - 0.1 : 0;
                  setVolume(newVolume);
                  if (sound) {
                    sound.setVolumeAsync(newVolume);
                  }
                }}
              >
                <Text style={styles.controlButtonText}>🔉</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => {
                  const newVolume = volume < 1 ? volume + 0.1 : 1;
                  setVolume(newVolume);
                  if (sound) {
                    sound.setVolumeAsync(newVolume);
                  }
                }}
              >
                <Text style={styles.controlButtonText}>🔊</Text>
              </TouchableOpacity>
            </View>
            
            {/* Commentaire sur le mode silencieux */}
            <Text style={styles.silentModeTip}>
              💡 Assurez-vous que votre téléphone n'est pas en mode silencieux
            </Text>
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
  soundsList: {
    maxHeight: 400,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 4,
  },
  soundRow: {
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
  soundRowSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  soundRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundRowEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  soundRowText: {
    flex: 1,
  },
  soundRowName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  soundRowDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  soundRowRight: {
    alignItems: 'flex-end',
  },
  soundRowTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    marginBottom: 4,
  },
  soundRowCheck: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerControls: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  playerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerTime: {
    color: '#94A3B8',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  playButtonMain: {
    backgroundColor: '#8B5CF6',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  startButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerOverlay: {
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
  playerContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
    flex: 1,
  },
  playerDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  silentModeTip: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default SoundsExercise;
