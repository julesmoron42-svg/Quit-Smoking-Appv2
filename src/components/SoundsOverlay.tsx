import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { soundsLibrary, categoryInfo, SoundTrack } from '../config/soundsConfig';
import ExerciseOverlay from './ExerciseOverlay';

interface SoundsOverlayProps {
  onClose: () => void;
  onStatsUpdate?: (stats: { panicCount: number; successCount: number }) => void;
}

const SoundsOverlay: React.FC<SoundsOverlayProps> = ({ onClose, onStatsUpdate }) => {
  const [selectedSound, setSelectedSound] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [showExerciseOverlay, setShowExerciseOverlay] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Organiser les sons par catégorie
  const soundsByCategory = Object.keys(categoryInfo).reduce((acc, category) => {
    acc[category] = soundsLibrary.filter(sound => sound.category === category);
    return acc;
  }, {} as Record<string, SoundTrack[]>);

  // Charger un son
  const loadSound = async (soundTrack: SoundTrack) => {
    try {
      // Arrêter le son actuel s'il y en a un
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      setSelectedSound(soundTrack);
      setCurrentTime(0);
      setIsPlaying(false);

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
      
      // Jouer automatiquement le son quand il est chargé
      await newSound.playAsync();
      setIsPlaying(true);
      setHasPlayedSound(true);
      
      // Écouter la fin du son
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setCurrentTime(Math.floor(status.positionMillis / 1000));
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentTime(0);
            // Demander si l'envie a été arrêtée quand le son se termine
            setTimeout(() => {
              showSuccessQuestion();
            }, 1000);
          }
        }
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement du son:', error);
      Alert.alert('Erreur', 'Impossible de charger le son. Vérifiez que le fichier existe.');
    }
  };

  // Fonction pour demander si l'envie a été arrêtée
  const showSuccessQuestion = () => {
    setShowExerciseOverlay(true);
  };

  // Fonction pour mettre à jour les statistiques de panique
  const updatePanicStats = (success: boolean) => {
    if (onStatsUpdate) {
      onStatsUpdate({
        panicCount: 1,
        successCount: success ? 1 : 0
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
    if (hasPlayedSound) {
      Alert.alert(
        '🎵 Session interrompue',
        'Tu quittes la session de sons. L\'envie de fumer a-t-elle disparu ?',
        [
          {
            text: '❌ Non, toujours envie',
            style: 'destructive',
            onPress: () => updatePanicStats(false)
          },
          {
            text: '✅ Oui, envie arrêtée !',
            style: 'default',
            onPress: () => updatePanicStats(true)
          }
        ]
      );
    } else {
      onClose();
    }
  };

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Si l'overlay d'exercice est affiché, montrer seulement celui-ci
  if (showExerciseOverlay) {
    return (
      <ExerciseOverlay
        onClose={() => {
          setShowExerciseOverlay(false);
          onClose();
        }}
        onStatsUpdate={onStatsUpdate}
        exerciseType="sounds"
        hasPlayedSound={hasPlayedSound}
      />
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <View style={styles.overlayHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>Sons Apaisants</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.overlaySubtitle}>Choisissez selon votre besoin</Text>
            
            <ScrollView style={styles.soundsList} showsVerticalScrollIndicator={false}>
              {/* Affichage par catégories */}
              {Object.entries(categoryInfo).map(([categoryKey, categoryInfo]) => {
                const categorySounds = soundsByCategory[categoryKey] || [];
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
                        onPress={() => loadSound(soundTrack)}
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

            {/* Contrôles de lecture */}
            {selectedSound && (
              <View style={styles.playerControls}>
                <View style={styles.controlsRow}>
                  {/* Bouton Stop (carré rouge) */}
                  <TouchableOpacity 
                    style={[styles.controlButton, styles.stopButton]}
                    onPress={() => {
                      if (sound) {
                        sound.stopAsync();
                        sound.setPositionAsync(0);
                        setCurrentTime(0);
                        setIsPlaying(false);
                      }
                    }}
                  >
                    <Text style={styles.controlButtonText}>⏹️</Text>
                  </TouchableOpacity>
                  
                  {/* Bouton Play (triangle vert) */}
                  <TouchableOpacity 
                    style={[styles.controlButton, styles.playButton]}
                    onPress={async () => {
                      if (sound) {
                        await sound.playAsync();
                        setIsPlaying(true);
                        setHasPlayedSound(true);
                      } else {
                        await loadSound(selectedSound);
                      }
                    }}
                  >
                    <Text style={styles.controlButtonText}>▶️</Text>
                  </TouchableOpacity>
                  
                  {/* Bouton Pause (deux barres) */}
                  <TouchableOpacity 
                    style={[styles.controlButton, styles.pauseButton]}
                    onPress={async () => {
                      if (sound) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                      }
                    }}
                  >
                    <Text style={styles.controlButtonText}>⏸️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  playButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  pauseButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default SoundsOverlay;