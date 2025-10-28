import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TimerSession } from '../types';
import { HapticService } from '../lib/hapticService';

interface ActionButtonsProps {
  session: TimerSession;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
}

const ActionButtons = memo(({ session, onStart, onStop, onRestart }: ActionButtonsProps) => {
  const navigation = useNavigation() as any;

  const handlePanicButton = async () => {
    await HapticService.error();
    
    Alert.alert(
      '🚨 Bouton Panique',
      'Cette fonctionnalité sera disponible avec le pack Panique Premium.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Voir les offres', onPress: () => navigation.navigate('Premium') }
      ]
    );
  };

  const handleAITherapistButton = async () => {
    await HapticService.selection();
    
    Alert.alert(
      '🤖 Coach IA',
      'Le coach IA arrive bientôt ! Cette fonctionnalité sera disponible très prochainement.',
      [{ text: 'OK' }]
    );
  };

  const handleRestart = () => {
    Alert.alert(
      'Redémarrer',
      'Êtes-vous sûr de vouloir redémarrer le chronomètre ? Tous vos progrès santé seront remis à zéro.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Redémarrer',
          style: 'destructive',
          onPress: onRestart,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Bouton Engager/Démarrer */}
      <TouchableOpacity
        style={[styles.actionButton, styles.commitButton]}
        onPress={async () => {
          await HapticService.subtle();
          session.startTimestamp ? onStop() : onStart();
        }}
      >
        <Text style={styles.actionButtonIcon}>
          {session.startTimestamp ? '✓' : '🚀'}
        </Text>
        <Text style={styles.actionButtonText}>
          {session.startTimestamp ? 'Engagé' : 'Démarrer'}
        </Text>
      </TouchableOpacity>

      {/* Bouton Recommencer */}
      <TouchableOpacity 
        style={[styles.actionButton, styles.restartButton]}
        onPress={async () => {
          await HapticService.subtle();
          handleRestart();
        }}
      >
        <Text style={styles.actionButtonIcon}>↻</Text>
        <Text style={styles.actionButtonText}>Recommencer</Text>
      </TouchableOpacity>

      {/* Bouton Panique */}
      <TouchableOpacity
        style={[styles.actionButton, styles.panicButton]}
        onPress={async () => {
          await HapticService.subtle();
          handlePanicButton();
        }}
      >
        <Text style={styles.actionButtonIcon}>🚨</Text>
        <Text style={styles.actionButtonText}>Panique</Text>
      </TouchableOpacity>

      {/* Bouton Coach IA */}
      <TouchableOpacity
        style={[styles.actionButton, styles.aiTherapistButton]}
        onPress={async () => {
          await HapticService.subtle();
          handleAITherapistButton();
        }}
      >
        <Text style={styles.actionButtonIcon}>💬</Text>
        <Text style={styles.actionButtonText}>Coach IA</Text>
      </TouchableOpacity>
    </View>
  );
});

ActionButtons.displayName = 'ActionButtons';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 15,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: 4,
  },
  commitButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: 'rgba(76, 175, 80, 0.7)',
    shadowColor: '#4CAF50',
  },
  panicButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.7)',
    shadowColor: '#EF4444',
  },
  aiTherapistButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.7)',
    shadowColor: '#8B5CF6',
  },
  restartButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
    borderColor: 'rgba(255, 152, 0, 0.7)',
    shadowColor: '#FF9800',
  },
  actionButtonIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 10,
  },
});

export default ActionButtons;
