import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StreakData } from '../types';
import { getSeedState, getSeedProgress } from '../utils/calculations';

interface SeedProgressProps {
  streak: StreakData;
}

const SeedProgress = memo(({ streak }: SeedProgressProps) => {
  const seedState = getSeedState(streak.currentStreak, 60);
  const seedProgress = getSeedProgress(streak.currentStreak, 60);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🌱 Ton arbre de progression</Text>
      <View style={styles.seedImage}>
        <Text style={styles.seedEmoji}>
          {seedState === 'tree' ? '🌳' : 
           seedState === 'small_tree' ? '🌲' : 
           seedState === 'sprout' ? '🌱' : '🌰'}
        </Text>
      </View>
      <Text style={styles.seedDescription}>
        Série de {streak.currentStreak} jour{streak.currentStreak > 1 ? 's' : ''}
      </Text>
      
      {/* Barre de progression de la graine */}
      <View style={styles.seedProgressContainer}>
        <View style={styles.seedProgressBar}>
          <View style={[styles.seedProgressFill, { width: `${seedProgress * 100}%` }]} />
        </View>
        <Text style={styles.seedProgressText}>
          {Math.round(seedProgress * 100)}% vers l'arbre complet
        </Text>
      </View>
      
      {/* Texte explicatif */}
      <View style={styles.seedExplanationContainer}>
        <Text style={styles.seedExplanationText}>
          💡 Pour faire évoluer ta plante, viens chaque jour entrer tes saisies quotidiennes. Un jour manqué fera redémarrer ta progression !
        </Text>
      </View>
    </View>
  );
});

SeedProgress.displayName = 'SeedProgress';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#8B45FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  seedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  seedEmoji: {
    fontSize: 40,
  },
  seedDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  seedProgressContainer: {
    width: '100%',
    marginTop: 15,
  },
  seedProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  seedProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  seedProgressText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  seedExplanationContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 12,
  },
  seedExplanationText: {
    color: '#E2E8F0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default SeedProgress;
