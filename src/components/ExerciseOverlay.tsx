import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ExerciseOverlayProps {
  onClose: () => void;
  onStatsUpdate?: (stats: { panicCount: number; successCount: number }) => void;
  exerciseType: 'breathing' | 'meditation' | 'sounds';
  hasPlayedSound?: boolean;
}

const ExerciseOverlay: React.FC<ExerciseOverlayProps> = ({ 
  onClose, 
  onStatsUpdate, 
  exerciseType,
  hasPlayedSound = false 
}) => {
  
  // Fonction pour demander si l'envie a été arrêtée
  const showSuccessQuestion = () => {
    Alert.alert(
      '🎵 Session terminée',
      'Le son apaisant est terminé. L\'envie de fumer a-t-elle disparu ?',
      [
        {
          text: '❌ Non, toujours envie',
          style: 'destructive',
          onPress: () => showAnotherExerciseQuestion()
        },
        {
          text: '✅ Oui, envie arrêtée !',
          style: 'default',
          onPress: () => updatePanicStats(true)
        }
      ]
    );
  };

  // Fonction pour proposer un autre exercice
  const showAnotherExerciseQuestion = () => {
    const exerciseName = exerciseType === 'breathing' ? 'autre exercice de respiration' : 
                        exerciseType === 'meditation' ? 'autre méditation' : 'autre son';
    
    Alert.alert(
      '🔄 Autre exercice ?',
      `Veux-tu essayer un ${exerciseName} ?`,
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
            console.log('Utilisateur veut essayer un autre exercice');
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

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      >
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.content}>
          <Text style={styles.title}>🎵 Session terminée</Text>
          <Text style={styles.subtitle}>
            {exerciseType === 'breathing' && 'Ton exercice de respiration est terminé'}
            {exerciseType === 'meditation' && 'Ta méditation est terminée'}
            {exerciseType === 'sounds' && 'Ton son apaisant est terminé'}
          </Text>
          
          <TouchableOpacity 
            style={styles.successButton}
            onPress={() => updatePanicStats(true)}
          >
            <Text style={styles.successButtonText}>✅ Oui, envie arrêtée !</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.failButton}
            onPress={() => updatePanicStats(false)}
          >
            <Text style={styles.failButtonText}>❌ Non, toujours envie</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
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
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
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
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  failButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  failButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExerciseOverlay;
