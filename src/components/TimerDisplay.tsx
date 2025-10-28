import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimerSession } from '../types';

interface TimerDisplayProps {
  elapsed: number;
  session: TimerSession;
  isSyncing: boolean;
}

const TimerDisplay = memo(({ elapsed, session, isSyncing }: TimerDisplayProps) => {
  const formatTimeDisplay = (elapsed: number) => {
    const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
    const hours = Math.floor((elapsed % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((elapsed % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((elapsed % (60 * 1000)) / 1000);
    
    return {
      main: `${days}j ${hours}h ${minutes}min`,
      seconds: `${seconds}s`
    };
  };

  const timeDisplay = formatTimeDisplay(elapsed);

  return (
    <View style={styles.container}>
      <Text style={styles.timerLabel}>Vous avez arrêté de fumer depuis:</Text>
      <View style={styles.timerDisplay}>
        <Text style={styles.timerText}>{timeDisplay.main}</Text>
        <TouchableOpacity style={styles.secondsButton}>
          <Text style={styles.secondsText}>{timeDisplay.seconds}</Text>
        </TouchableOpacity>
      </View>
      {isSyncing && (
        <View style={styles.syncIndicator}>
          <Text style={styles.syncText}>🔄 Synchronisation...</Text>
        </View>
      )}
    </View>
  );
});

TimerDisplay.displayName = 'TimerDisplay';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.9,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginRight: 15,
  },
  secondsButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.5)',
  },
  secondsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncIndicator: {
    marginTop: 10,
    alignItems: 'center',
  },
  syncText: {
    color: '#8B45FF',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default TimerDisplay;
