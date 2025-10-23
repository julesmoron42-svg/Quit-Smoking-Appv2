import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { soundsLibrary, categoryInfo, SoundTrack } from '../config/soundsConfig';

const { width, height } = Dimensions.get('window');

interface SoundsLibraryProps {
  onClose: () => void;
  onStatsUpdate?: (stats: { panicCount: number; successCount: number }) => void;
}


const SoundsLibrary: React.FC<SoundsLibraryProps> = ({ onClose, onStatsUpdate }) => {
  const [selectedSound, setSelectedSound] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [volume, setVolume] = useState(0.7);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  // Filtrer les sons par catégorie
  const filteredSounds = selectedCategory === 'all' 
    ? soundsLibrary 
    : soundsLibrary.filter(sound => sound.category === selectedCategory);

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
        soundTrack.audioPath, // Utilise le chemin configuré dans soundsConfig.ts
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

  // Jouer/Pause
  const togglePlayPause = async () => {
    if (!selectedSound || !sound) return;

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
              // Demander si l'envie a été arrêtée quand le son se termine
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
            // Laisser l'utilisateur choisir un autre son
            console.log('Utilisateur veut essayer un autre son');
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
      <LinearGradient
        colors={['#071033', '#1E293B', '#0F172A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎵 Sons Apaisants</Text>
          <Text style={styles.subtitle}>MyQuitSpace - Respire & Libère</Text>
        </View>

        {/* Filtres de catégories - Design Quittr */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>🎵 Sons Apaisants</Text>
          <Text style={styles.categoriesSubtitle}>Utilise ton rythme cardiaque pour réguler quand les envies montent</Text>
          
          <View style={styles.categoriesGrid}>
            <TouchableOpacity
              style={[styles.categoryCard, selectedCategory === 'all' && styles.categoryCardActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.categoryGradient}
              >
                <Text style={styles.categoryEmoji}>🎵</Text>
                <Text style={styles.categoryName}>Tous</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {Object.entries(categoryInfo).map(([key, info]) => {
              const count = soundsLibrary.filter(sound => sound.category === key).length;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.categoryCard, selectedCategory === key && styles.categoryCardActive]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <LinearGradient
                    colors={[info.color, info.color + '80']}
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryEmoji}>{info.emoji}</Text>
                    <Text style={styles.categoryName}>{info.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Liste des sons */}
        <ScrollView style={styles.soundsList}>
          {filteredSounds.map((soundTrack) => (
            <TouchableOpacity
              key={soundTrack.id}
              style={[
                styles.soundCard,
                selectedSound?.id === soundTrack.id && styles.soundCardSelected
              ]}
              onPress={() => loadSound(soundTrack)}
            >
              <View style={styles.soundHeader}>
                <Text style={styles.soundEmoji}>{soundTrack.emoji}</Text>
                <View style={styles.soundInfo}>
                  <Text style={styles.soundTitle}>{soundTrack.title}</Text>
                  <Text style={styles.soundDescription}>{soundTrack.description}</Text>
                  <Text style={styles.soundDuration}>⏱️ {soundTrack.duration} min</Text>
                </View>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    loadSound(soundTrack);
                  }}
                >
                  <Text style={styles.playButtonText}>▶️</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.soundDetails}>
                <Text style={styles.soundUsage}>🎯 {soundTrack.usage}</Text>
                <Text style={styles.soundTip}>💡 {soundTrack.tip}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Contrôles de lecture */}
        {selectedSound && (
          <View style={styles.playerControls}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerTitle}>{selectedSound.emoji} {selectedSound.title}</Text>
              <Text style={styles.playerTime}>
                {formatTime(currentTime)} / {formatTime(selectedSound.duration * 60)}
              </Text>
            </View>
            
            {/* Barre de progression */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            
            {/* Contrôle de volume */}
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeLabel}>🔊 Volume</Text>
              <View style={styles.volumeSlider}>
                <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
              </View>
              <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
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
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  categoriesTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoriesSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 100,
  },
  categoryCardActive: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  soundsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  soundCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  soundCardSelected: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  soundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  soundEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  soundInfo: {
    flex: 1,
  },
  soundTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  soundDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  soundDuration: {
    color: '#64748B',
    fontSize: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  soundDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  soundUsage: {
    color: '#E2E8F0',
    fontSize: 12,
    marginBottom: 4,
  },
  soundTip: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
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
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  volumeLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginRight: 10,
    minWidth: 80,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginRight: 10,
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  volumeValue: {
    color: '#FFFFFF',
    fontSize: 12,
    minWidth: 35,
    textAlign: 'right',
  },
});

export default SoundsLibrary;
