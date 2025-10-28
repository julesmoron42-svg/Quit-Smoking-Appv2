import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile, DailyEntry, AppSettings } from '../types';
import { calculateCigarettesAvoided, calculateMoneySaved } from '../utils/calculations';

interface StatsDisplayProps {
  profile: UserProfile;
  dailyEntries: Record<string, DailyEntry>;
  elapsed: number;
  settings: AppSettings;
  streak: { currentStreak: number };
}

const StatsDisplay = memo(({ profile, dailyEntries, elapsed, settings, streak }: StatsDisplayProps) => {
  const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries, elapsed);
  const moneySaved = calculateMoneySaved(cigarettesAvoided, settings.pricePerCig);

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>🚬</Text>
        <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
          {cigarettesAvoided}
        </Text>
        <Text style={styles.statLabel}>Cigarettes évitées</Text>
        <Text style={styles.statSubLabel}>
          Sur {Object.keys(dailyEntries).length} jour{Object.keys(dailyEntries).length > 1 ? 's' : ''}
        </Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>💰</Text>
        <Text style={[styles.statNumber, { color: '#51CF66' }]}>
          {moneySaved.toFixed(1)}
        </Text>
        <Text style={styles.statLabel}>€ économisés</Text>
        <Text style={styles.statSubLabel}>
          @ {settings.pricePerCig}€/cig
        </Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>🌱</Text>
        <Text style={[styles.statNumber, { color: '#7C3AED' }]}>
          {streak.currentStreak}
        </Text>
        <Text style={styles.statLabel}>Jours de croissance</Text>
        <Text style={styles.statSubLabel}>
          Série en cours
        </Text>
      </View>
    </View>
  );
});

StatsDisplay.displayName = 'StatsDisplay';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 2,
  },
  statSubLabel: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default StatsDisplay;
